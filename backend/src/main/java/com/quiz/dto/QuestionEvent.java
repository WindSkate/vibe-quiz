package com.quiz.dto;

import java.util.List;

public record QuestionEvent(
        String type,
        int questionNumber,
        int totalQuestions,
        String text,
        String imagePath,
        List<String> options,
        int timeLeft
) {
}
