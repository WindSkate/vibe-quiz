package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TopicDto(
        Long id,

        @NotBlank(message = "Название темы обязательно")
        @Size(max = 255, message = "Название не должно превышать 255 символов")
        String name,

        @Size(max = 1000, message = "Описание не должно превышать 1000 символов")
        String description
) {
}
