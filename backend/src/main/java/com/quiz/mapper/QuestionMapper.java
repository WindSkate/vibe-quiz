package com.quiz.mapper;

import com.quiz.dto.QuestionDto;
import com.quiz.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    QuestionDto toDto(Question question);

    List<QuestionDto> toDtoList(List<Question> questions);

    Question toEntity(QuestionDto dto);

    void update(QuestionDto dto, @MappingTarget Question question);
}
