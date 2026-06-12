package com.quiz.service;

import com.quiz.dto.*;
import com.quiz.exception.LobbyException;
import com.quiz.exception.ResourceNotFoundException;
import com.quiz.model.GameState;
import com.quiz.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LobbyService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final TopicRepository topicRepository;

    private static final String LOBBY_KEY = "lobby:";
    private static final String PLAYERS_KEY = "lobby:";
    private static final String PLAYERS_SUFFIX = ":players";
    private static final String PLAYER_KEY = "player:";

    public LobbyDto create(CreateLobbyRequest request) {
        var topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new ResourceNotFoundException("Тема не найдена: " + request.topicId()));

        String code;
        do {
            code = generateCode();
        } while (Boolean.TRUE.equals(redisTemplate.hasKey(LOBBY_KEY + code)));

        String lobbyKey = LOBBY_KEY + code;
        Map<Object, Object> lobbyData = new HashMap<>();
        lobbyData.put("code", code);
        lobbyData.put("topicId", topic.getId());
        lobbyData.put("topicName", topic.getName());
        lobbyData.put("hostId", UUID.randomUUID().toString());
        lobbyData.put("state", GameState.WAITING.name());
        lobbyData.put("currentQuestionIndex", 0);
        lobbyData.put("playerCount", 0);
        lobbyData.put("createdAt", System.currentTimeMillis());

        redisTemplate.opsForHash().putAll(lobbyKey, lobbyData);

        return buildLobbyDto(code, lobbyData, 0);
    }

    public LobbyDto getInfo(String code) {
        String lobbyKey = LOBBY_KEY + code;
        Map<Object, Object> lobbyData = redisTemplate.opsForHash().entries(lobbyKey);

        if (lobbyData.isEmpty()) {
            throw new LobbyException("Лобби не найдено: " + code);
        }

        Long playerCount = redisTemplate.opsForSet().size(PLAYERS_KEY + code + PLAYERS_SUFFIX);
        return buildLobbyDto(code, lobbyData, playerCount != null ? playerCount.intValue() : 0);
    }

    public JoinLobbyResponse join(String code, JoinLobbyRequest request) {
        String lobbyKey = LOBBY_KEY + code;
        Map<Object, Object> lobbyData = redisTemplate.opsForHash().entries(lobbyKey);

        if (lobbyData.isEmpty()) {
            throw new LobbyException("Лобби не найдено: " + code);
        }

        String state = (String) lobbyData.get("state");
        if (GameState.FINISHED.name().equals(state)) {
            throw new LobbyException("Игра уже завершена");
        }

        List<PlayerDto> existingPlayers = getPlayers(code);
        for (PlayerDto player : existingPlayers) {
            if (player.name().equalsIgnoreCase(request.playerName())) {
                if (request.playerId() != null && request.playerId().equals(player.id())) {
                    return new JoinLobbyResponse(player.id(), getInfo(code));
                }
                if (GameState.WAITING.name().equals(state)) {
                    throw new LobbyException("Игрок с таким именем уже существует");
                }
                return new JoinLobbyResponse(player.id(), getInfo(code));
            }
        }

        if (!GameState.WAITING.name().equals(state)) {
            throw new LobbyException("Игра уже началась");
        }

        String playerId = UUID.randomUUID().toString();
        String playerKey = PLAYER_KEY + code + ":" + playerId;

        Map<Object, Object> playerData = new HashMap<>();
        playerData.put("id", playerId);
        playerData.put("name", request.playerName());
        playerData.put("lobbyCode", code);
        playerData.put("score", 0);
        playerData.put("connected", true);

        redisTemplate.opsForHash().putAll(playerKey, playerData);
        redisTemplate.opsForSet().add(PLAYERS_KEY + code + PLAYERS_SUFFIX, playerId);

        redisTemplate.opsForHash().put(lobbyKey, "playerCount",
                redisTemplate.opsForSet().size(PLAYERS_KEY + code + PLAYERS_SUFFIX));

        LobbyDto lobbyDto = getInfo(code);
        return new JoinLobbyResponse(playerId, lobbyDto);
    }

    public List<PlayerDto> getPlayers(String code) {
        String playersSetKey = PLAYERS_KEY + code + PLAYERS_SUFFIX;
        Set<Object> playerIds = redisTemplate.opsForSet().members(playersSetKey);

        if (playerIds == null || playerIds.isEmpty()) {
            return Collections.emptyList();
        }

        return playerIds.stream()
                .map(id -> {
                    String playerKey = PLAYER_KEY + code + ":" + id;
                    Map<Object, Object> data = redisTemplate.opsForHash().entries(playerKey);
                    if (data.isEmpty()) return null;
                    return new PlayerDto(
                            (String) data.get("id"),
                            (String) data.get("name"),
                            Integer.parseInt(data.get("score").toString())
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public void updateState(String code, GameState state) {
        String lobbyKey = LOBBY_KEY + code;
        if (Boolean.FALSE.equals(redisTemplate.hasKey(lobbyKey))) {
            throw new LobbyException("Лобби не найдено: " + code);
        }
        redisTemplate.opsForHash().put(lobbyKey, "state", state.name());
    }

    public void delete(String code) {
        String playersSetKey = PLAYERS_KEY + code + PLAYERS_SUFFIX;
        Set<Object> playerIds = redisTemplate.opsForSet().members(playersSetKey);

        if (playerIds != null) {
            for (Object playerId : playerIds) {
                redisTemplate.delete(PLAYER_KEY + code + ":" + playerId);
            }
        }

        redisTemplate.delete(playersSetKey);
        redisTemplate.delete(LOBBY_KEY + code);
    }

    private String generateCode() {
        return String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }

    private LobbyDto buildLobbyDto(String code, Map<Object, Object> data, int playerCount) {
        return new LobbyDto(
                code,
                Long.parseLong(data.get("topicId").toString()),
                (String) data.get("topicName"),
                (String) data.get("hostId"),
                GameState.valueOf((String) data.get("state")),
                playerCount
        );
    }
}
