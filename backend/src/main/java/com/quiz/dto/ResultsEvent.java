package com.quiz.dto;

import java.util.List;

public record ResultsEvent(
        String type,
        List<GameResultDto> results
) {
}
