package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.dto.LoginRequest;
import com.music.musicapp.model.User;
import com.music.musicapp.repository.UserRepository;
import com.music.musicapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest loginRequest) {
        String identifier = loginRequest.getUsernameOrEmail();
        String password = loginRequest.getPassword();

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                // ✅ Generate JWT token
                String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
                
                // ✅ Create response with token
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("token", token);
                responseData.put("user", new HashMap<String, Object>() {{
                    put("id", user.getId());
                    put("username", user.getUsername());
                    put("email", user.getEmail());
                    put("role", user.getRole()); // ADMIN or USER
                }});
                
                return ResponseEntity.ok(ApiResponse.success("Login Successful", responseData));
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
        
        // ✅ Set default role
        user.setRole("USER");
        
        User savedUser = userRepository.save(user);
        
        // ✅ Generate token for immediate login
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole());
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("user", new HashMap<String, Object>() {{
            put("id", savedUser.getId());
            put("username", savedUser.getUsername());
            put("email", savedUser.getEmail());
            put("role", savedUser.getRole());
        }});
        
        return ResponseEntity.ok(ApiResponse.success("Account ban gaya!", responseData));
    }
    
    // AuthController.java ke andar
    @Autowired
    private com.music.musicapp.repository.SongRepository songRepository;

    @Autowired
    private com.music.musicapp.repository.PlaylistRepository playlistRepository;

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Long>> getStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalSongs", songRepository.count());
        stats.put("totalPlaylists", playlistRepository.count());
        stats.put("totalUsers", userRepository.count());
        return ResponseEntity.ok(stats);
    }
}