package com.quiz.websocket;

import com.quiz.dto.SubmitAnswerRequest;
import com.quiz.service.GameSessionService;
import com.quiz.service.GameTimerService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameSessionService gameSessionService;
    private final GameTimerService gameTimerService;
    private final LobbyWebSocketController lobbyWebSocketController;

    @MessageMapping("/game/{code}/answer")
    public void submitAnswer(SubmitAnswerRequest request) {
        gameSessionService.submitAnswer(request.lobbyCode(), request.playerId(), request.answer());

        int answered = gameSessionService.getAnsweredCount(request.lobbyCode());
        int players = gameSessionService.getPlayerCount(request.lobbyCode());

        if (answered >= players && players > 0) {
            gameTimerService.cancelTimer(request.lobbyCode());
            lobbyWebSocketController.sendNextQuestion(request.lobbyCode());
        }
    }
}
