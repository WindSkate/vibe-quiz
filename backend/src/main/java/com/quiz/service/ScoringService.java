package com.quiz.service;

import com.quiz.dto.GameResultDto;
import com.quiz.dto.PlayerDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoringService {

    public List<GameResultDto> calculateResults(List<PlayerDto> players, Map<String, Integer> scores) {
        List<PlayerScore> playerScores = players.stream()
                .map(p -> new PlayerScore(
                        p.id(),
                        p.name(),
                        scores.getOrDefault(p.id(), 0)
                ))
                .sorted(Comparator.comparingInt(PlayerScore::score).reversed())
                .collect(Collectors.toList());

        AtomicInteger rank = new AtomicInteger(1);
        return playerScores.stream()
                .map(ps -> new GameResultDto(rank.getAndIncrement(), ps.name(), ps.score()))
                .collect(Collectors.toList());
    }

    private record PlayerScore(String id, String name, int score) {
    }
}
