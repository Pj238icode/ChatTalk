package com.example.realchatapplication.service;

import com.example.realchatapplication.dto.EditProfileDto;
import com.example.realchatapplication.dto.UserDTO;
import com.example.realchatapplication.model.User;
import com.example.realchatapplication.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {




    private final UserRepository userRepository;

    private final ImageService imageService;

    private final ModelMapper modelMapper;

    public UserService(UserRepository userRepository,ImageService imageService,ModelMapper modelMapper){
        this.userRepository=userRepository;
        this.imageService=imageService;
        this.modelMapper=modelMapper;
    }

    public boolean userExists(String username){
        return userRepository.existsByUsername(username);
    }

    public void setUserOnlineStatus(String username, boolean isOnline){
        userRepository.updateUserOnlineStatus(username, isOnline);
    }
    public List<String> getOnlineUsers() {
        List<User> onlineUsers = userRepository.findByIsOnlineTrue();
        return onlineUsers.stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }


    public UserDTO updateUser(String email, EditProfileDto editProfileDTO) {

        // ✅ Safely fetch user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Update username if changed
        String newUsername = editProfileDTO.getUsername();
        if (newUsername != null && !newUsername.trim().equals(user.getUsername())) {
            newUsername = newUsername.trim();
            if (userRepository.findByUsername(newUsername).isPresent()) {
                throw new RuntimeException("Username is already in use");
            }
            user.setUsername(newUsername);
        }

        // Update profile image if provided
        MultipartFile profileImage = editProfileDTO.getProfileImage();
        if (profileImage != null && !profileImage.isEmpty()) {

            // Validate MIME type
            String contentType = profileImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Uploaded file is not a valid image");
            }

            // Validate extension
            String originalFilename = profileImage.getOriginalFilename();
            if (originalFilename == null) {
                throw new RuntimeException("File must have a valid name");
            }
            String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            Set<String> allowedExtensions = Set.of("png", "jpg", "jpeg", "gif");
            if (!allowedExtensions.contains(extension)) {
                throw new RuntimeException("Invalid file type. Allowed: png, jpg, jpeg, gif");
            }

            // Upload and save URL
            String imageUrl = imageService.uploadFile(profileImage);
            user.setImageUrl(imageUrl);
        }

        // Save updated user
        User updatedUser = userRepository.save(user);

        // Convert to DTO
        return modelMapper.map(updatedUser, UserDTO.class);
    }



}
