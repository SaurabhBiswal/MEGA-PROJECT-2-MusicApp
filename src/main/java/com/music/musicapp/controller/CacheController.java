package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.service.CacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cache")
@CrossOrigin(origins = "*")
public class CacheController {
    
    @Autowired
    private CacheService cacheService;
    
    // Save track for offline
    @PostMapping("/offline/save")
    public ResponseEntity<ApiResponse> saveForOffline(
            @RequestBody Map<String, Object> trackData) {
        try {
            String trackId = (String) trackData.get("id");
            if (trackId == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Track ID is required"));
            }
            
            // Fixed: saveObjectToCache now returns boolean
            boolean success = cacheService.saveObjectToCache("offline_" + trackId, trackData, 2592000);
            
            if (success) {
                return ResponseEntity.ok(
                    ApiResponse.success("Track saved for offline", Map.of("trackId", trackId))
                );
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to save for offline"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error saving for offline: " + e.getMessage()));
        }
    }
    
    // Get offline tracks
    @GetMapping("/offline/tracks")
    public ResponseEntity<ApiResponse> getOfflineTracks() {
        try {
            List<String> offlineKeys = cacheService.getOfflineKeys();
            return ResponseEntity.ok(
                ApiResponse.success("Offline tracks", offlineKeys)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting offline tracks: " + e.getMessage()));
        }
    }
    
    // Get offline audio URL
    @GetMapping("/offline/audio/{trackId}")
    public ResponseEntity<ApiResponse> getOfflineAudio(@PathVariable String trackId) {
        try {
            String audioPath = cacheService.getOfflineAudioPath(trackId);
            if (audioPath != null) {
                return ResponseEntity.ok(
                    ApiResponse.success("Offline audio URL", Map.of("path", audioPath))
                );
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Track not available offline"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting offline audio: " + e.getMessage()));
        }
    }
    
    // Get cache statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getCacheStats() {
        try {
            Map<String, Object> stats = cacheService.getCacheStats();
            return ResponseEntity.ok(
                ApiResponse.success("Cache statistics", stats)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting cache stats: " + e.getMessage()));
        }
    }
    
    // Clear cache
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse> clearCache() {
        try {
            cacheService.clearCache();
            return ResponseEntity.ok(
                ApiResponse.success("Cache cleared successfully", null)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error clearing cache: " + e.getMessage()));
        }
    }
    
    // Check if track is cached
    @GetMapping("/offline/check/{trackId}")
    public ResponseEntity<ApiResponse> checkIfCached(@PathVariable String trackId) {
        try {
            String audioPath = cacheService.getOfflineAudioPath(trackId);
            boolean isCached = audioPath != null;
            
            return ResponseEntity.ok(
                ApiResponse.success("Cache check result", 
                    Map.of("trackId", trackId, "isCached", isCached))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error checking cache: " + e.getMessage()));
        }
    }
    
    // Get cache info
    @GetMapping("/info")
    public ResponseEntity<ApiResponse> getCacheInfo() {
        try {
            Map<String, Object> stats = cacheService.getCacheStats();
            Map<String, Object> info = Map.of(
                "enabled", stats.get("enabled"),
                "maxSizeMB", 1024, // Should come from configuration
                "description", "Cache service for storing offline music and metadata",
                "offlineTrackCount", stats.getOrDefault("offlineTrackCount", 0)
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Cache information", info)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting cache info: " + e.getMessage()));
        }
    }
}