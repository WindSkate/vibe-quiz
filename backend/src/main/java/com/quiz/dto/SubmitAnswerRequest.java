package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SubmitAnswerRequest(
        @NotBlank(message = "Код лобби обязателен")
        String lobbyCode,

        @NotBlank(message = "ID игрока обязателен")
        String playerId,

        @NotBlank(message = "Ответ обязателен")
        @Pattern(regexp = "[A-D]", message = "Ответ должен быть A, B, C или D")
        String answer
) {
}
