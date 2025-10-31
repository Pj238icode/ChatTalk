package com.example.realchatapplication.controller;


import com.example.realchatapplication.dto.EditProfileDto;
import com.example.realchatapplication.dto.UserDTO;
import com.example.realchatapplication.model.User;
import com.example.realchatapplication.repository.UserRepository;
import com.example.realchatapplication.service.ImageService;
import com.example.realchatapplication.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile/")
public class ProfileController {

    private final ImageService imageService;

    private final UserService userService;

    private final UserRepository userRepository;

    ProfileController(ImageService imageService, UserService userService,UserRepository userRepository){
        this.imageService=imageService;
        this.userService=userService;
        this.userRepository=userRepository;

    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @ModelAttribute EditProfileDto editProfileDTO,
            Authentication authentication
    ) {
        try {
            User principal = (User) authentication.getPrincipal(); // cast to your User
            String email = principal.getEmail();
            System.out.println("Updating profile for: " + email);

            UserDTO updatedUser = userService.updateUser(email, editProfileDTO);

            return ResponseEntity.ok(Map.of("success", true, "user", updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "Failed to update profile", "error", e.getMessage()));
        }
    }



}
