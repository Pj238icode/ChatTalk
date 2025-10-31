package com.example.realchatapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    private String sender;      // Username or userId
    private String recipient;   // Username or userId
    private String content;
    private String color;
    private LocalDateTime timestamp = LocalDateTime.now();
    private MessageType type;
    private String chatRoomId;
    private String fileUrl;

    public enum MessageType {
        CHAT, PRIVATE_MESSAGE, JOIN, LEAVE, TYPING,FILE
    }
}
