package com.quiz.dto;

import java.util.Map;

public record AnswerRevealEvent(
        String type,
        String correctAnswer,
        Map<String, String> playerAnswers
) {
}
