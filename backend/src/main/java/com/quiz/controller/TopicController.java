package com.quiz.controller;

import com.quiz.dto.TopicDto;
import com.quiz.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    public List<TopicDto> getAll() {
        return topicService.getAll();
    }

    @GetMapping("/{id}")
    public TopicDto getById(@PathVariable Long id) {
        return topicService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TopicDto create(@Valid @RequestBody TopicDto dto) {
        return topicService.create(dto);
    }

    @PutMapping("/{id}")
    public TopicDto update(@PathVariable Long id, @Valid @RequestBody TopicDto dto) {
        return topicService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        topicService.delete(id);
    }
}
