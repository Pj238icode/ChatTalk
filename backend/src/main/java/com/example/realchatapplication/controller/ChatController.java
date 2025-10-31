package com.example.realchatapplication.controller;

import com.example.realchatapplication.dto.TypingMessage;
import com.example.realchatapplication.model.ChatMessage;
import com.example.realchatapplication.repository.ChatMessageRepository;
import com.example.realchatapplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private UserService userService;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.addUser")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {

        if (userService.userExists(chatMessage.getSender())) {

            // Store username in session
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
            userService.setUserOnlineStatus(chatMessage.getSender(), true);

            System.out.println("User added Successfully " + chatMessage.getSender()
                    + " with session ID " + headerAccessor.getSessionId());

            // Broadcast updated online users list
            messagingTemplate.convertAndSend("/topic/onlineUsers", userService.getOnlineUsers());

            // Optionally, broadcast JOIN message to public
            chatMessage.setTimestamp(LocalDateTime.now());
            if (chatMessage.getContent() == null) chatMessage.setContent("");
            return chatMessageRepository.save(chatMessage);
        }
        return null;
    }



    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {

        if (!userService.userExists(chatMessage.getSender()) || !userService.userExists(chatMessage.getRecipient())) {
            System.out.println("ERROR: Sender " + chatMessage.getSender() + " or recipient " + chatMessage.getRecipient() + " does not exist");
            return;
        }

        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        if (chatMessage.getType() == null) {
            chatMessage.setType(ChatMessage.MessageType.PRIVATE_MESSAGE);
        }

        // Validate FILE messages
        if (chatMessage.getType() == ChatMessage.MessageType.FILE &&
                (chatMessage.getFileUrl() == null || chatMessage.getFileUrl().isEmpty())) {
            System.out.println("ERROR: fileUrl is missing for FILE message!");
            return;
        }

        if (chatMessage.getType() != ChatMessage.MessageType.FILE && chatMessage.getContent() == null) {
            chatMessage.setContent("");
        }

        // Save to MongoDB
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        System.out.println("Message saved successfully with Id " + savedMessage.getId());

        // Send via WebSocket
        try {
            String recipientDestination = "/user/" + chatMessage.getRecipient() + "/queue/private";
            String senderDestination = "/user/" + chatMessage.getSender() + "/queue/private";

            messagingTemplate.convertAndSend(recipientDestination, savedMessage);
            messagingTemplate.convertAndSend(senderDestination, savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingMessage typingMessage) {
        // Broadcast typing event to recipient
        messagingTemplate.convertAndSendToUser(
                typingMessage.getRecipient(),
                "/queue/typing",
                typingMessage
        );
    }










}














