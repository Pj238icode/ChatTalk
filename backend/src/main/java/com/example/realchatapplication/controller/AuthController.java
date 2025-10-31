package com.example.realchatapplication.controller;

import com.example.realchatapplication.dto.*;
import com.example.realchatapplication.model.User;
import com.example.realchatapplication.repository.UserRepository;
import com.example.realchatapplication.service.AuthenticationService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<UserDTO> signup(@RequestBody RegisterRequestDTO registerRequestDTO) {
        return ResponseEntity.ok(authenticationService.signup(registerRequestDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        // Authenticate user and generate JWT
        LoginResponseDTO loginResponseDTO = authenticationService.login(loginRequestDTO);

        // Create HTTP-only cookie for added security
        ResponseCookie responseCookie = ResponseCookie.from("JWT", loginResponseDTO.getToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(1 * 60 * 60) // 1 hour
                .sameSite("Strict")
                .build();

        // ✅ Return both token and user data in the response body
        Map<String, Object> responseBody = Map.of(
                "token", loginResponseDTO.getToken(),
                "user", loginResponseDTO.getUserDTO()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(responseBody);
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        return authenticationService.logout(token);
    }

    @GetMapping("/getonlineusers")
    public ResponseEntity<Map<String, Object>> getOnlineUsers() {
        return ResponseEntity.ok(authenticationService.getOnlineUsers());
    }

    @GetMapping("/getcurrentuser")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("USER NOT AUTHORIZED");
        }

        String username = authentication.getName();
        System.out.println(username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(convertToUserDTO(user));
    }

    // ✅ NEW ENDPOINT: Get All Registered Users + Online Status
    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("USER NOT AUTHORIZED");
        }

        // Fetch current authenticated username
        String currentUsername = authentication.getName();

        // Fetch list of all users
        List<User> allUsers = userRepository.findAll();

        // Fetch currently online users from AuthenticationService
        Map<String, Object> onlineUsersData = authenticationService.getOnlineUsers();
        Set<String> onlineUsernames = (Set<String>) onlineUsersData.getOrDefault("onlineUsers", Set.of());

        // Prepare response with online status
        List<Map<String, Object>> userList = new ArrayList<>();
        for (User user : allUsers) {
            if (!user.getUsername().equals(currentUsername)) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("online", onlineUsernames.contains(user.getUsername()));
                userMap.put("imageUrl", user.getImageUrl());
                userList.add(userMap);
            }
        }

        return ResponseEntity.ok(Map.of("users", userList));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            Object principal = authentication.getPrincipal();
            String email;
            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername(); // login is email
            } else if (principal instanceof User) {
                email = ((User) principal).getEmail();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid principal type");
            }

            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");

            boolean success = authenticationService.changePassword(email, oldPassword, newPassword);


            if (!success) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Old password is incorrect"));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + e.getMessage());
        }
    }







    private UserDTO convertToUserDTO(User user) {
        return modelMapper.map(user, UserDTO.class);
    }
}

