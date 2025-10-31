package com.example.realchatapplication.repository;

import com.example.realchatapplication.model.ChatMessage;
import com.example.realchatapplication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    @Query("{ '$or': [ { 'sender': ?0, 'recipient': ?1 }, { 'sender': ?1, 'recipient': ?0 } ] }")
    List<ChatMessage> findPrivateMessagesBetweenTwoUsers(String user1, String user2);

}
