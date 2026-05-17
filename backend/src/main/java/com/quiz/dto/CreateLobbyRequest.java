package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateLobbyRequest(
        @NotNull(message = "ID темы обязателен")
        Long topicId
) {
}
