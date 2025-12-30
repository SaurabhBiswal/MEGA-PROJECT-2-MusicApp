package com.music.musicapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String sayHello() {
        return "🎵 Music Streaming App - Day 1 Complete! 🎉";
    }
    
    @GetMapping("/api/status")
    public String getStatus() {
        return "✅ Spring Boot 3.5.9 is running with H2 Database!";
    }
    
    @GetMapping("/test/h2")
    public String testH2() {
        return "H2 Console available at: http://localhost:8080/h2-console";
    }
}