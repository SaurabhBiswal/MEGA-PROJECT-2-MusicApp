package com.music.musicapp.controller;

import com.music.musicapp.service.MusicDiscoveryService;
import com.music.musicapp.service.PodcastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/discover")
@CrossOrigin(origins = "*")
public class MusicDiscoveryController {
    
    @Autowired
    private MusicDiscoveryService musicDiscoveryService;
    
    @Autowired
    private PodcastService podcastService;
    
    // Simple search endpoint
    @GetMapping("/search")
    public Map<String, Object> searchMusic(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> musicResults = musicDiscoveryService.searchMusic(query, limit);
            List<Map<String, Object>> podcastResults = podcastService.searchPodcasts(query, limit);
            
            response.put("success", true);
            response.put("query", query);
            response.put("music", musicResults);
            response.put("podcasts", podcastResults);
            response.put("musicCount", musicResults.size());
            response.put("podcastCount", podcastResults.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // Get trending music
    @GetMapping("/trending")
    public Map<String, Object> getTrendingMusic() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> trending = musicDiscoveryService.getTrendingMusic();
            response.put("success", true);
            response.put("trending", trending);
            response.put("count", trending.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // Get available genres
    @GetMapping("/genres")
    public Map<String, Object> getGenres() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> genres = musicDiscoveryService.getAvailableGenres();
            response.put("success", true);
            response.put("genres", genres);
            response.put("count", genres.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // Get podcast categories
    @GetMapping("/podcasts/categories")
    public Map<String, Object> getPodcastCategories() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> categories = podcastService.getPodcastCategories();
            response.put("success", true);
            response.put("categories", categories);
            response.put("count", categories.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // Get podcast episodes
    @GetMapping("/podcasts/{podcastId}/episodes")
    public Map<String, Object> getPodcastEpisodes(
            @PathVariable String podcastId,
            @RequestParam(defaultValue = "10") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Map<String, Object>> episodes = podcastService.getPodcastEpisodes(podcastId, limit);
            response.put("success", true);
            response.put("podcastId", podcastId);
            response.put("episodes", episodes);
            response.put("count", episodes.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // Health check for discovery service
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Music Discovery Service");
        response.put("timestamp", new Date().toString());
        return response;
    }
    
    // Test endpoint
    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🎧 Music Discovery API is working!");
        response.put("endpoints", Arrays.asList(
            "GET /api/discover/search?q=rock - Search music & podcasts",
            "GET /api/discover/trending - Get trending music",
            "GET /api/discover/genres - Get music genres",
            "GET /api/discover/podcasts/categories - Get podcast categories",
            "GET /api/discover/health - Health check"
        ));
        response.put("timestamp", new Date());
        return response;
    }
}