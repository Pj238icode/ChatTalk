package com.example.realchatapplication.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;

    @JsonIgnore
    private String password;

    private String email;

    private boolean isOnline = false;

    private String color;

    private String imageUrl;
}
