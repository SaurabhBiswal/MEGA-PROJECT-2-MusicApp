package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.service.PodcastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/podcasts")
@CrossOrigin(origins = "*")
public class PodcastController {
    
    @Autowired
    private PodcastService podcastService;
    
    // Search podcasts
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchPodcasts(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<Map<String, Object>> results = podcastService.searchPodcasts(query, limit);
            return ResponseEntity.ok(
                ApiResponse.success("Podcast search results", results)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error searching podcasts: " + e.getMessage()));
        }
    }
    
    // Get podcast categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse> getCategories() {
        try {
            List<Map<String, Object>> categories = podcastService.getPodcastCategories();
            return ResponseEntity.ok(
                ApiResponse.success("Podcast categories", categories)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting categories: " + e.getMessage()));
        }
    }
    
    // Get podcast episodes
    @GetMapping("/{podcastId}/episodes")
    public ResponseEntity<ApiResponse> getEpisodes(
            @PathVariable String podcastId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<Map<String, Object>> episodes = podcastService.getPodcastEpisodes(podcastId, limit);
            return ResponseEntity.ok(
                ApiResponse.success("Podcast episodes", episodes)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting episodes: " + e.getMessage()));
        }
    }
    
    // Stream podcast episode
    @GetMapping("/episodes/{episodeId}/stream")
    public ResponseEntity<ApiResponse> streamEpisode(@PathVariable String episodeId) {
        try {
            Map<String, Object> streamInfo = podcastService.streamEpisode(episodeId);
            return ResponseEntity.ok(
                ApiResponse.success("Stream info", streamInfo)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error streaming episode: " + e.getMessage()));
        }
    }
    
    // Download podcast episode
    @PostMapping("/episodes/{episodeId}/download")
    public ResponseEntity<ApiResponse> downloadEpisode(@PathVariable String episodeId) {
        try {
            Map<String, Object> downloadInfo = podcastService.downloadEpisode(episodeId);
            return ResponseEntity.ok(
                ApiResponse.success("Download info", downloadInfo)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error downloading episode: " + e.getMessage()));
        }
    }
    
    // Subscribe to podcast
    @PostMapping("/{podcastId}/subscribe")
    public ResponseEntity<ApiResponse> subscribeToPodcast(
            @PathVariable String podcastId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            boolean success = podcastService.subscribeToPodcast(userId, podcastId);
            if (success) {
                return ResponseEntity.ok(
                    ApiResponse.success("Subscribed to podcast", null)
                );
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to subscribe"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error subscribing: " + e.getMessage()));
        }
    }
    
    // Get subscribed podcasts
    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse> getSubscriptions(@RequestHeader("X-User-Id") String userId) {
        try {
            List<Map<String, Object>> subscriptions = podcastService.getSubscribedPodcasts(userId);
            return ResponseEntity.ok(
                ApiResponse.success("Subscribed podcasts", subscriptions)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting subscriptions: " + e.getMessage()));
        }
    }
}