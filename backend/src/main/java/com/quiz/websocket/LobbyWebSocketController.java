package com.quiz.websocket;

import com.quiz.dto.*;
import com.quiz.model.GameState;
import com.quiz.service.GameSessionService;
import com.quiz.service.LobbyService;
import com.quiz.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class LobbyWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final LobbyService lobbyService;
    private final GameSessionService gameSessionService;
    private final ScoringService scoringService;

    @MessageMapping("/lobby/{code}/start")
    public void startGame(@DestinationVariable String code, StartGameRequest request) {
        LobbyDto lobby = lobbyService.getInfo(code);

        if (!lobby.state().equals(GameState.WAITING)) {
            return;
        }

        gameSessionService.startGame(code);
        sendQuestion(code);
    }

    private void sendQuestion(String code) {
        Map<String, Object> questionData = gameSessionService.getCurrentQuestion(code);

        if (questionData == null) {
            sendResults(code);
            return;
        }

        int currentIndex = gameSessionService.getCurrentIndex(code);
        int totalQuestions = gameSessionService.getTotalQuestions(code);

        List<String> options = List.of(
                (String) questionData.get("optionA"),
                (String) questionData.get("optionB"),
                (String) questionData.get("optionC"),
                (String) questionData.get("optionD")
        );

        QuestionEvent event = new QuestionEvent(
                "QUESTION",
                currentIndex + 1,
                totalQuestions,
                (String) questionData.get("text"),
                (String) questionData.get("imagePath"),
                options,
                gameSessionService.getTimePerQuestion()
        );

        messagingTemplate.convertAndSend("/topic/game/" + code, event);
    }

    public void sendTimeout(String code) {
        TimeoutEvent event = new TimeoutEvent("TIMEOUT", "Время вышло!");
        messagingTemplate.convertAndSend("/topic/game/" + code, event);
    }

    public void sendNextQuestion(String code) {
        gameSessionService.nextQuestion(code);

        if (gameSessionService.isGameFinished(code)) {
            sendResults(code);
            return;
        }

        sendQuestion(code);
    }

    private void sendResults(String code) {
        lobbyService.updateState(code, GameState.FINISHED);

        List<PlayerDto> players = lobbyService.getPlayers(code);
        Map<String, Integer> scores = gameSessionService.getScores(code);
        List<GameResultDto> results = scoringService.calculateResults(players, scores);

        ResultsEvent event = new ResultsEvent("RESULTS", results);
        messagingTemplate.convertAndSend("/topic/game/" + code, event);
    }

    public void broadcastLobbyUpdate(String code) {
        List<PlayerDto> players = lobbyService.getPlayers(code);
        LobbyUpdateEvent event = new LobbyUpdateEvent("LOBBY_UPDATE", players, players.size());
        messagingTemplate.convertAndSend("/topic/lobby/" + code, event);
    }
}
