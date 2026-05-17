package com.quiz.mapper;

import com.quiz.dto.TopicDto;
import com.quiz.entity.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {

    TopicDto toDto(Topic topic);

    List<TopicDto> toDtoList(List<Topic> topics);

    Topic toEntity(TopicDto dto);

    void update(TopicDto dto, @MappingTarget Topic topic);
}
