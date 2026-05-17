package com.quiz.dto;

import java.util.List;

public record LobbyUpdateEvent(
        String type,
        List<PlayerDto> players,
        int playerCount
) {
}
