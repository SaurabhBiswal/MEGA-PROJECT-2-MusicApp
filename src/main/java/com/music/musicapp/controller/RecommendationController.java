package com.music.musicapp.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.*;
import com.music.musicapp.service.RecommendationService;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @GetMapping("/for-user/{userId}")
    public ResponseEntity<?> getUserRecommendations(@PathVariable Long userId) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> song = new HashMap<>();
            song.put("id", i);
            song.put("title", "Recommended Song " + i);
            song.put("artist", "Artist " + i);
            song.put("reason", "Based on your listening history");
            recommendations.add(song);
        }
        
        return ResponseEntity.ok(recommendations);
    }
    
    @GetMapping("/similar/{songId}")
    public ResponseEntity<?> getSimilarSongs(@PathVariable Long songId) {
        List<Map<String, Object>> similarSongs = new ArrayList<>();
        
        for (int i = 1; i <= 3; i++) {
            Map<String, Object> song = new HashMap<>();
            song.put("id", songId + i);
            song.put("title", "Similar Song " + i);
            song.put("artist", "Similar Artist");
            similarSongs.add(song);
        }
        
        return ResponseEntity.ok(similarSongs);
    }
    
    @GetMapping("/trending")
    public ResponseEntity<?> getTrending() {
        List<Map<String, Object>> trending = new ArrayList<>();
        
        String[] trendingSongs = {"Blinding Lights", "Save Your Tears", "Levitating", "Stay", "Good 4 U"};
        String[] artists = {"The Weeknd", "The Weeknd", "Dua Lipa", "The Kid LAROI, Justin Bieber", "Olivia Rodrigo"};
        
        for (int i = 0; i < trendingSongs.length; i++) {
            Map<String, Object> song = new HashMap<>();
            song.put("rank", i + 1);
            song.put("title", trendingSongs[i]);
            song.put("artist", artists[i]);
            song.put("plays", 1000000 - (i * 100000));
            trending.add(song);
        }
        
        return ResponseEntity.ok(trending);
    }
}