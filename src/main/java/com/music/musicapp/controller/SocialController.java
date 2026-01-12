package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "*")
public class SocialController {
    
    @Autowired
    private SocialService socialService;
    
    // Add rating and review
    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse> addRating(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> ratingData) {
        try {
            String trackId = (String) ratingData.get("trackId");
            Double rating = Double.valueOf(ratingData.get("rating").toString());
            String review = (String) ratingData.get("review");
            String reviewTitle = (String) ratingData.get("reviewTitle");
            
            Map<String, Object> result = socialService.addRatingAndReview(
                userId, trackId, rating, review, reviewTitle);
            
            return ResponseEntity.ok(
                ApiResponse.success("Rating added successfully", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error adding rating: " + e.getMessage()));
        }
    }
    
    // Get user activity feed
    @GetMapping("/activity/feed")
    public ResponseEntity<ApiResponse> getActivityFeed(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<Map<String, Object>> activities = socialService.getActivityFeed(userId, limit);
            return ResponseEntity.ok(
                ApiResponse.success("Activity feed retrieved", activities)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting activity feed: " + e.getMessage()));
        }
    }
    
    // Get recent reviews
    @GetMapping("/reviews/recent")
    public ResponseEntity<ApiResponse> getRecentReviews(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> reviews = socialService.getRecentReviews(limit);
            return ResponseEntity.ok(
                ApiResponse.success("Recent reviews retrieved", reviews)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting recent reviews: " + e.getMessage()));
        }
    }
    
    // Get user's friends
    @GetMapping("/friends")
    public ResponseEntity<ApiResponse> getUserFriends(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            List<Map<String, Object>> friends = socialService.getUserFriends(userId);
            return ResponseEntity.ok(
                ApiResponse.success("User friends retrieved", friends)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting friends: " + e.getMessage()));
        }
    }
    
    // Send friend request
    @PostMapping("/friends/request")
    public ResponseEntity<ApiResponse> sendFriendRequest(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> requestData) {
        try {
            Long friendId = Long.valueOf(requestData.get("friendId").toString());
            Map<String, Object> result = socialService.sendFriendRequest(userId, friendId);
            return ResponseEntity.ok(
                ApiResponse.success("Friend request sent", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error sending friend request: " + e.getMessage()));
        }
    }
    
    // Accept friend request
    @PostMapping("/friends/accept")
    public ResponseEntity<ApiResponse> acceptFriendRequest(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> requestData) {
        try {
            Long friendId = Long.valueOf(requestData.get("friendId").toString());
            Map<String, Object> result = socialService.acceptFriendRequest(userId, friendId);
            return ResponseEntity.ok(
                ApiResponse.success("Friend request accepted", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error accepting friend request: " + e.getMessage()));
        }
    }
    
    // Get user profile
    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse> getUserProfile(@PathVariable Long userId) {
        try {
            Map<String, Object> profile = socialService.getUserProfile(userId);
            return ResponseEntity.ok(
                ApiResponse.success("User profile retrieved", profile)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting profile: " + e.getMessage()));
        }
    }
    
    // Share track
    @PostMapping("/share")
    public ResponseEntity<ApiResponse> shareTrack(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> shareData) {
        try {
            String trackId = (String) shareData.get("trackId");
            String platform = (String) shareData.get("platform");
            String message = (String) shareData.get("message");
            
            Map<String, Object> result = socialService.shareTrack(
                trackId, platform, message, userId);
            
            return ResponseEntity.ok(
                ApiResponse.success("Share info generated", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error sharing: " + e.getMessage()));
        }
    }
    
    // Get track reviews
    @GetMapping("/tracks/{trackId}/reviews")
    public ResponseEntity<ApiResponse> getTrackReviews(
            @PathVariable String trackId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // This would call a method in SocialService to get track reviews
            Map<String, Object> result = Map.of(
                "trackId", trackId,
                "reviews", List.of(), // Placeholder
                "page", page,
                "size", size
            );
            return ResponseEntity.ok(
                ApiResponse.success("Track reviews retrieved", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting reviews: " + e.getMessage()));
        }
    }
    
    // Mark review as helpful
    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<ApiResponse> markHelpful(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId) {
        try {
            // This would call a method in SocialService to mark helpful
            Map<String, Object> result = Map.of(
                "reviewId", reviewId,
                "userId", userId,
                "message", "Marked as helpful"
            );
            return ResponseEntity.ok(
                ApiResponse.success("Marked as helpful", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error marking helpful: " + e.getMessage()));
        }
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(
            ApiResponse.success("Social API is working", Map.of("status", "healthy"))
        );
    }
}