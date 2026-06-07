package com.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionDto(
        Long id,

        @NotNull(message = "ID темы обязателен")
        Long topicId,

        @NotBlank(message = "Текст вопроса обязателен")
        String text,

        String imagePath,

        @NotBlank(message = "Вариант A обязателен")
        @Size(max = 500)
        String optionA,

        @NotBlank(message = "Вариант B обязателен")
        @Size(max = 500)
        String optionB,

        @NotBlank(message = "Вариант C обязателен")
        @Size(max = 500)
        String optionC,

        @NotBlank(message = "Вариант D обязателен")
        @Size(max = 500)
        String optionD,

        @NotBlank(message = "Правильный ответ обязателен")
        @Size(max = 500, message = "Правильный ответ слишком длинный")
        String correct
) {
}
