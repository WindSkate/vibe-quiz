package com.quiz.dto;

import com.quiz.model.GameState;

public record LobbyDto(
        String code,
        Long topicId,
        String topicName,
        String hostId,
        GameState state,
        int playerCount
) {
}
