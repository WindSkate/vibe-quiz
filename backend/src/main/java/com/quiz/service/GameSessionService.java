package com.quiz.service;

import com.quiz.dto.LobbyDto;
import com.quiz.dto.QuestionDto;
import com.quiz.exception.LobbyException;
import com.quiz.model.GameState;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameSessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final QuestionService questionService;
    private final LobbyService lobbyService;

    private static final String GAME_KEY = "game:";
    private static final int MAX_QUESTIONS = 20;
    private static final int TIME_PER_QUESTION = 30;

    public int getTimePerQuestion() {
        return TIME_PER_QUESTION;
    }

    public void startGame(String lobbyCode) {
        LobbyDto lobby = lobbyService.getInfo(lobbyCode);
        List<QuestionDto> allQuestions = questionService.getByTopicId(lobby.topicId());

        if (allQuestions.isEmpty()) {
            throw new LobbyException("Нет вопросов для выбранной темы");
        }

        List<QuestionDto> selected = selectQuestions(allQuestions);
        List<Map<String, Object>> questionsJson = selected.stream()
                .map(q -> Map.<String, Object>of(
                        "id", q.id(),
                        "text", q.text(),
                        "imagePath", q.imagePath() != null ? q.imagePath() : "",
                        "optionA", q.optionA(),
                        "optionB", q.optionB(),
                        "optionC", q.optionC(),
                        "optionD", q.optionD(),
                        "correct", q.correct()
                ))
                .collect(Collectors.toList());

        String gameKey = GAME_KEY + lobbyCode;
        Map<String, Object> gameData = new HashMap<>();
        gameData.put("lobbyCode", lobbyCode);
        gameData.put("questions", questionsJson);
        gameData.put("currentIndex", 0);
        gameData.put("answers", new HashMap<String, String>());
        gameData.put("scores", new HashMap<String, Integer>());
        gameData.put("startedAt", System.currentTimeMillis());

        redisTemplate.opsForHash().putAll(gameKey, gameData);
        lobbyService.updateState(lobbyCode, GameState.PLAYING);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCurrentQuestion(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Map<Object, Object> gameData = redisTemplate.opsForHash().entries(gameKey);

        if (gameData.isEmpty()) {
            throw new LobbyException("Игровая сессия не найдена");
        }

        int currentIndex = Integer.parseInt(gameData.get("currentIndex").toString());
        List<Map<String, Object>> questions = (List<Map<String, Object>>) gameData.get("questions");

        if (currentIndex >= questions.size()) {
            return null;
        }

        return questions.get(currentIndex);
    }

    public boolean submitAnswer(String lobbyCode, String playerId, String answer) {
        String gameKey = GAME_KEY + lobbyCode;
        Map<Object, Object> gameData = redisTemplate.opsForHash().entries(gameKey);

        if (gameData.isEmpty()) {
            return false;
        }

        int currentIndex = Integer.parseInt(gameData.get("currentIndex").toString());
        List<Map<String, Object>> questions = (List<Map<String, Object>>) gameData.get("questions");

        if (currentIndex >= questions.size()) {
            return false;
        }

        Map<String, Object> currentQuestion = questions.get(currentIndex);
        boolean isCorrect = currentQuestion.get("correct").equals(answer);

        Map<String, String> answers = (Map<String, String>) gameData.get("answers");
        answers.put(playerId, answer);

        Map<String, Integer> scores = (Map<String, Integer>) gameData.get("scores");
        if (isCorrect) {
            scores.merge(playerId, 1, Integer::sum);
        }

        redisTemplate.opsForHash().put(gameKey, "answers", answers);
        redisTemplate.opsForHash().put(gameKey, "scores", scores);

        return isCorrect;
    }

    public int getAnsweredCount(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Object answers = redisTemplate.opsForHash().get(gameKey, "answers");
        if (answers instanceof Map) {
            return ((Map<?, ?>) answers).size();
        }
        return 0;
    }

    public int getPlayerCount(String lobbyCode) {
        String playersKey = "lobby:" + lobbyCode + ":players";
        Long size = redisTemplate.opsForSet().size(playersKey);
        return size != null ? size.intValue() : 0;
    }

    public void nextQuestion(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Map<Object, Object> gameData = redisTemplate.opsForHash().entries(gameKey);

        if (gameData.isEmpty()) {
            throw new LobbyException("Игровая сессия не найдена");
        }

        int currentIndex = Integer.parseInt(gameData.get("currentIndex").toString());
        List<Map<String, Object>> questions = (List<Map<String, Object>>) gameData.get("questions");

        if (currentIndex + 1 >= questions.size()) {
            lobbyService.updateState(lobbyCode, GameState.FINISHED);
            return;
        }

        redisTemplate.opsForHash().put(gameKey, "currentIndex", currentIndex + 1);
        redisTemplate.opsForHash().put(gameKey, "answers", new HashMap<String, String>());
    }

    public int getCurrentIndex(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Object index = redisTemplate.opsForHash().get(gameKey, "currentIndex");
        return index != null ? Integer.parseInt(index.toString()) : 0;
    }

    public int getTotalQuestions(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Map<Object, Object> gameData = redisTemplate.opsForHash().entries(gameKey);

        if (gameData.isEmpty()) {
            return 0;
        }

        List<Map<String, Object>> questions = (List<Map<String, Object>>) gameData.get("questions");
        return questions.size();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Integer> getScores(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Object scores = redisTemplate.opsForHash().get(gameKey, "scores");
        return scores != null ? (Map<String, Integer>) scores : new HashMap<>();
    }

    public boolean isGameFinished(String lobbyCode) {
        String gameKey = GAME_KEY + lobbyCode;
        Map<Object, Object> gameData = redisTemplate.opsForHash().entries(gameKey);

        if (gameData.isEmpty()) {
            return false;
        }

        int currentIndex = Integer.parseInt(gameData.get("currentIndex").toString());
        List<Map<String, Object>> questions = (List<Map<String, Object>>) gameData.get("questions");

        return currentIndex >= questions.size();
    }

    private List<QuestionDto> selectQuestions(List<QuestionDto> allQuestions) {
        if (allQuestions.size() <= MAX_QUESTIONS) {
            return allQuestions;
        }

        List<QuestionDto> shuffled = new ArrayList<>(allQuestions);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, MAX_QUESTIONS);
    }
}
