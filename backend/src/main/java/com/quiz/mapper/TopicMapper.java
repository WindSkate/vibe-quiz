package com.quiz.mapper;

import com.quiz.dto.TopicDto;
import com.quiz.entity.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {

    TopicDto toDto(Topic topic);

    List<TopicDto> toDtoList(List<Topic> topics);

    Topic toEntity(TopicDto dto);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    void update(TopicDto dto, @MappingTarget Topic topic);
}
