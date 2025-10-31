package com.example.realchatapplication.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingMessage {
    private String sender;
    private String recipient;
    private boolean isTyping;

    // getters and setters
}