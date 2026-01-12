package com.music.musicapp.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "🎵 Music App API is running! 🎵";
    }
    
    @GetMapping("/status")
    public String status() {
        return "✅ API Status: Active\n" +
               "📅 Day: 3 - REST API Design\n" +
               "🚀 Endpoints: /api/users/*, /api/songs/*";
    }
}