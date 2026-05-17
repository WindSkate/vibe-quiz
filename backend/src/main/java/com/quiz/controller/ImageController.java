package com.quiz.controller;

import com.quiz.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        String filename = imageService.store(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("filename", filename, "url", "/images/" + filename));
    }

    @DeleteMapping("/{filename}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String filename) {
        imageService.delete(filename);
    }
}
