package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitAnswerRequest(
        @NotBlank(message = "Код лобби обязателен")
        String lobbyCode,

        @NotBlank(message = "ID игрока обязателен")
        String playerId,

        @NotBlank(message = "Ответ обязателен")
        String answer
) {
}
