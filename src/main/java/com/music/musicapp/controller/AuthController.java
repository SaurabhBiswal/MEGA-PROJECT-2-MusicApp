package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.dto.LoginRequest;
import com.music.musicapp.model.User;
import com.music.musicapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // React connect karne ke liye
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest loginRequest) {
    // Tumhare DTO mein field ka naam 'usernameOrEmail' hai
    String identifier = loginRequest.getUsernameOrEmail(); 
    String password = loginRequest.getPassword();

    // UserRepository ka use karke dhoondo (identifer ko dono jagah pass karo)
    Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);

    if (userOpt.isPresent()) {
        User user = userOpt.get();
        if (user.getPassword().equals(password)) {
            return ResponseEntity.ok(ApiResponse.success("Login Successful", user));
        } else {
            return ResponseEntity.status(401).body(ApiResponse.error("Galat Password!"));
        }
    }
    return ResponseEntity.status(404).body(ApiResponse.error("User nahi mila!"));
}

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username pehle se liya gaya hai!"));
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email pehle se registered hai!"));
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Account ban gaya!", savedUser));
    }
}