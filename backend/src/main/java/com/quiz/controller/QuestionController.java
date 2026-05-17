package com.quiz.controller;

import com.quiz.dto.QuestionDto;
import com.quiz.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/topics/{topicId}/questions")
    public List<QuestionDto> getByTopic(@PathVariable Long topicId) {
        return questionService.getByTopicId(topicId);
    }

    @GetMapping("/questions/{id}")
    public QuestionDto getById(@PathVariable Long id) {
        return questionService.getById(id);
    }

    @PostMapping("/topics/{topicId}/questions")
    @ResponseStatus(HttpStatus.CREATED)
    public QuestionDto create(@PathVariable Long topicId, @Valid @RequestBody QuestionDto dto) {
        QuestionDto question = new QuestionDto(
                null, topicId, dto.text(), dto.imagePath(),
                dto.optionA(), dto.optionB(), dto.optionC(), dto.optionD(), dto.correct()
        );
        return questionService.create(question);
    }

    @PutMapping("/questions/{id}")
    public QuestionDto update(@PathVariable Long id, @Valid @RequestBody QuestionDto dto) {
        return questionService.update(id, dto);
    }

    @DeleteMapping("/questions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        questionService.delete(id);
    }
}
