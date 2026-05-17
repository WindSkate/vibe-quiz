package com.quiz.service;

import com.quiz.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    private final Path storageLocation;

    public ImageService(@Value("${app.storage.location}") String location) {
        this.storageLocation = Paths.get(location).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new StorageException("Не удалось создать директорию для хранения изображений", e);
        }
    }

    public String store(MultipartFile file) {
        validateImage(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID() + extension;
        Path targetLocation = storageLocation.resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetLocation);
            return filename;
        } catch (IOException e) {
            throw new StorageException("Не удалось сохранить файл: " + filename, e);
        }
    }

    public void delete(String filename) {
        try {
            Path filePath = storageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(storageLocation)) {
                throw new StorageException("Недопустимое имя файла");
            }
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new StorageException("Не удалось удалить файл: " + filename, e);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new StorageException("Файл пустой");
        }

        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new StorageException("Файл не является изображением");
            }
        } catch (IOException e) {
            throw new StorageException("Ошибка чтения изображения", e);
        }
    }
}
