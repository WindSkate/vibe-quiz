package com.quiz.dto;

public record JoinLobbyResponse(
        String playerId,
        LobbyDto lobby
) {
}
