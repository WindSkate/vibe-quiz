package com.quiz.service;

import com.quiz.dto.TopicDto;
import com.quiz.entity.Topic;
import com.quiz.exception.ResourceNotFoundException;
import com.quiz.mapper.TopicMapper;
import com.quiz.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    public List<TopicDto> getAll() {
        return topicMapper.toDtoList(topicRepository.findAll());
    }

    public TopicDto getById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тема не найдена: " + id));
        return topicMapper.toDto(topic);
    }

    @Transactional
    public TopicDto create(TopicDto dto) {
        Topic topic = topicMapper.toEntity(dto);
        topic = topicRepository.save(topic);
        return topicMapper.toDto(topic);
    }

    @Transactional
    public TopicDto update(Long id, TopicDto dto) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тема не найдена: " + id));
        topicMapper.update(dto, topic);
        topic = topicRepository.save(topic);
        return topicMapper.toDto(topic);
    }

    @Transactional
    public void delete(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new ResourceNotFoundException("Тема не найдена: " + id);
        }
        topicRepository.deleteById(id);
    }
}
