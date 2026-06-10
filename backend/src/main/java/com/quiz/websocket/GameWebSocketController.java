package com.quiz.websocket;

import com.quiz.dto.*;
import com.quiz.model.GameState;
import com.quiz.service.GameSessionService;
import com.quiz.service.GameTimerService;
import com.quiz.service.LobbyService;
import com.quiz.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameSessionService gameSessionService;
    private final GameTimerService gameTimerService;
    private final LobbyWebSocketController lobbyWebSocketController;
    private final SimpMessagingTemplate messagingTemplate;
    private final LobbyService lobbyService;
    private final ScoringService scoringService;

    @MessageMapping("/game/{code}/answer")
    public void submitAnswer(SubmitAnswerRequest request) {
        gameSessionService.submitAnswer(request.lobbyCode(), request.playerId(), request.answer());

        int answered = gameSessionService.getAnsweredCount(request.lobbyCode());
        int players = gameSessionService.getPlayerCount(request.lobbyCode());

        if (answered >= players && players > 0) {
            gameTimerService.cancelTimer(request.lobbyCode());
            lobbyWebSocketController.sendAnswerReveal(request.lobbyCode());
        }
    }

    @MessageMapping("/game/{code}/state")
    public void getGameState(GameStateRequest request) {
        String code = request.lobbyCode();
        String playerId = request.playerId();

        if (playerId == null || playerId.isBlank()) {
            return;
        }

        String dest = "/topic/player-" + playerId;

        var lobby = lobbyService.getInfo(code);
        if (lobby.state() == GameState.WAITING) {
            return;
        }

        if (lobby.state() == GameState.FINISHED) {
            List<PlayerDto> players = lobbyService.getPlayers(code);
            Map<String, Integer> scores = gameSessionService.getScores(code);
            List<GameResultDto> results = scoringService.calculateResults(players, scores);
            ResultsEvent event = new ResultsEvent("RESULTS", results);
            messagingTemplate.convertAndSend(dest, event);
            return;
        }

        String phase = gameSessionService.getPhase(code);

        if ("ANSWER_REVEAL".equals(phase)) {
            Map<String, Object> questionData = gameSessionService.getCurrentQuestion(code);
            if (questionData == null) {
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

            QuestionEvent questionEvent = new QuestionEvent(
                    "QUESTION",
                    currentIndex + 1,
                    totalQuestions,
                    (String) questionData.get("text"),
                    (String) questionData.get("imagePath"),
                    options,
                    0
            );
            messagingTemplate.convertAndSend(dest, questionEvent);

            String correctAnswer = (String) questionData.get("correct");
            Map<String, String> playerAnswers = gameSessionService.getPlayerAnswers(code);
            AnswerRevealEvent event = new AnswerRevealEvent("ANSWER_REVEAL", correctAnswer, playerAnswers);
            messagingTemplate.convertAndSend(dest, event);
            return;
        }

        Map<String, Object> questionData = gameSessionService.getCurrentQuestion(code);
        if (questionData == null) {
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

        long questionStartedAt = gameSessionService.getQuestionStartedAt(code);
        int elapsed = (int) ((System.currentTimeMillis() - questionStartedAt) / 1000);
        int timeLeft = Math.max(0, gameSessionService.getTimePerQuestion() - elapsed);

        QuestionEvent event = new QuestionEvent(
                "QUESTION",
                currentIndex + 1,
                totalQuestions,
                (String) questionData.get("text"),
                (String) questionData.get("imagePath"),
                options,
                timeLeft
        );

        messagingTemplate.convertAndSend(dest, event);
    }
}
