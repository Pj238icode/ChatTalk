package com.example.realchatapplication.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupRequest {
    private String name;
    private String createdBy;
    private List<String> members;

    // getters & setters
}

