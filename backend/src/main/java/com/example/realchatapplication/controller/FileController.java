package com.example.realchatapplication.controller;

import com.example.realchatapplication.model.ChatMessage;
import com.example.realchatapplication.repository.ChatMessageRepository;
import com.example.realchatapplication.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final ImageService imageService;

    public FileController(ImageService imageService) {
        this.imageService = imageService;
    }

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sender") String sender,
            @RequestParam("recipient") String recipient,
            @RequestParam(value = "color", required = false) String color
    ) {
        try {
            // Upload file to S3
            String fileUrl = imageService.uploadFile(file);

            // Optionally save metadata in DB
            ChatMessage message = new ChatMessage();
            message.setSender(sender);
            message.setRecipient(recipient);
            message.setFileUrl(fileUrl);
            message.setType(ChatMessage.MessageType.FILE);
            message.setColor(color);

            chatMessageRepository.save(message);


            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

}
