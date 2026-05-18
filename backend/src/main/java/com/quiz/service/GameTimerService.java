package com.quiz.service;

import com.quiz.dto.GameResultDto;
import com.quiz.dto.LobbyDto;
import com.quiz.dto.PlayerDto;
import com.quiz.dto.QuestionEvent;
import com.quiz.dto.ResultsEvent;
import com.quiz.dto.TimeoutEvent;
import com.quiz.model.GameState;
import com.quiz.model.GameState;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class GameTimerService {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameSessionService gameSessionService;
    private final LobbyService lobbyService;
    private final ScoringService scoringService;

    private static final int TIME_PER_QUESTION = 30;
    private static final int INTERMISSION_DELAY = 3;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    private final Map<String, ScheduledFuture<?>> lobbyTimers = new ConcurrentHashMap<>();

    public void startQuestionTimer(String lobbyCode) {
        cancelTimer(lobbyCode);

        ScheduledFuture<?> questionTimer = scheduler.schedule(() -> {
            sendTimeout(lobbyCode);

            scheduler.schedule(() -> {
                sendNextQuestion(lobbyCode);
            }, INTERMISSION_DELAY, TimeUnit.SECONDS);
        }, TIME_PER_QUESTION, TimeUnit.SECONDS);

        lobbyTimers.put(lobbyCode, questionTimer);
    }

    public void cancelTimer(String lobbyCode) {
        ScheduledFuture<?> existing = lobbyTimers.remove(lobbyCode);
        if (existing != null) {
            existing.cancel(false);
        }
    }

    private void sendTimeout(String code) {
        TimeoutEvent event = new TimeoutEvent("TIMEOUT", "Время вышло!");
        messagingTemplate.convertAndSend("/topic/game/" + code, event);
    }

    private void sendNextQuestion(String code) {
        cancelTimer(code);

        LobbyDto lobby = lobbyService.getInfo(code);
        if (lobby.state().equals(GameState.FINISHED)) {
            sendResults(code);
            return;
        }

        gameSessionService.nextQuestion(code);

        LobbyDto updatedLobby = lobbyService.getInfo(code);
        if (updatedLobby.state().equals(GameState.FINISHED)) {
            sendResults(code);
            return;
        }

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

        startQuestionTimer(code);
    }

    private void sendResults(String code) {
        cancelTimer(code);
        lobbyService.updateState(code, GameState.FINISHED);

        List<PlayerDto> players = lobbyService.getPlayers(code);
        Map<String, Integer> scores = gameSessionService.getScores(code);
        List<GameResultDto> results = scoringService.calculateResults(players, scores);

        ResultsEvent event = new ResultsEvent("RESULTS", results);
        messagingTemplate.convertAndSend("/topic/game/" + code, event);
    }

    public void shutdown() {
        scheduler.shutdown();
    }
}
