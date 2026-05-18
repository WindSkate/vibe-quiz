package com.quiz.controller;

import com.quiz.dto.*;
import com.quiz.service.LobbyService;
import com.quiz.websocket.LobbyWebSocketController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lobbies")
@RequiredArgsConstructor
public class LobbyController {

    private final LobbyService lobbyService;
    private final LobbyWebSocketController lobbyWebSocketController;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LobbyDto create(@Valid @RequestBody CreateLobbyRequest request) {
        return lobbyService.create(request);
    }

    @GetMapping("/{code}")
    public LobbyDto getInfo(@PathVariable String code) {
        return lobbyService.getInfo(code);
    }

    @PostMapping("/{code}/join")
    public JoinLobbyResponse join(@PathVariable String code, @Valid @RequestBody JoinLobbyRequest request) {
        JoinLobbyResponse response = lobbyService.join(code, request);
        try {
            lobbyWebSocketController.broadcastLobbyUpdate(code);
        } catch (Exception ignored) {
            // WebSocket might not be connected yet
        }
        return response;
    }

    @GetMapping("/{code}/players")
    public List<PlayerDto> getPlayers(@PathVariable String code) {
        return lobbyService.getPlayers(code);
    }

    @DeleteMapping("/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String code) {
        lobbyService.delete(code);
    }
}
