package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinLobbyRequest(
        @NotBlank(message = "Имя игрока обязательно")
        @Size(min = 1, max = 30, message = "Имя должно быть от 1 до 30 символов")
        String playerName,
        String playerId
) {
}
