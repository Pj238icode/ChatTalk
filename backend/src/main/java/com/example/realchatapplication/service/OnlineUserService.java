package com.example.realchatapplication.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class OnlineUserService {

    private final Set<String> onlineUsers = new HashSet<>();
    private final SimpMessagingTemplate messagingTemplate;

    public OnlineUserService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void userJoined(String username) {
        onlineUsers.add(username);
        broadcastOnlineUsers();
    }

    public void userLeft(String username) {
        onlineUsers.remove(username);
        broadcastOnlineUsers();
    }

    private void broadcastOnlineUsers() {
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
    }
}
