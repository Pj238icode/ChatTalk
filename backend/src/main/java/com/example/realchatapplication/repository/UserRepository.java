package com.example.realchatapplication.repository;

import com.example.realchatapplication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    List<User> findByIsOnlineTrue();

    @Update("{ '$set': { 'isOnline': ?1 } }")
    @Query("{ 'username': ?0 }")
    void updateUserOnlineStatus(String username, boolean isOnline);


    List<User> findByUsernameIn(List<String> usernames);

    Optional<User> findByEmail(String email);




}
