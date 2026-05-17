package com.quiz.websocket;

import com.quiz.dto.SubmitAnswerRequest;
import com.quiz.service.GameSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameSessionService gameSessionService;

    @MessageMapping("/game/{code}/answer")
    public void submitAnswer(SubmitAnswerRequest request) {
        gameSessionService.submitAnswer(request.lobbyCode(), request.playerId(), request.answer());
    }
}
