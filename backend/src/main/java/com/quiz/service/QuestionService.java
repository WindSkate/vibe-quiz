package com.quiz.service;

import com.quiz.dto.QuestionDto;
import com.quiz.entity.Question;
import com.quiz.exception.ResourceNotFoundException;
import com.quiz.mapper.QuestionMapper;
import com.quiz.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionMapper questionMapper;

    public List<QuestionDto> getByTopicId(Long topicId) {
        return questionMapper.toDtoList(questionRepository.findByTopicId(topicId));
    }

    public QuestionDto getById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Вопрос не найден: " + id));
        return questionMapper.toDto(question);
    }

    @Transactional
    public QuestionDto create(QuestionDto dto) {
        Question question = questionMapper.toEntity(dto);
        question = questionRepository.save(question);
        return questionMapper.toDto(question);
    }

    @Transactional
    public QuestionDto update(Long id, QuestionDto dto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Вопрос не найден: " + id));
        questionMapper.update(dto, question);
        question = questionRepository.save(question);
        return questionMapper.toDto(question);
    }

    @Transactional
    public void delete(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Вопрос не найден: " + id);
        }
        questionRepository.deleteById(id);
    }
}
