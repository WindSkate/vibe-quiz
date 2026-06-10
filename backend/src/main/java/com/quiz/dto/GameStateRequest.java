package com.quiz.dto;

public record GameStateRequest(
        String lobbyCode,
        String playerId
) {
}
