package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.dto.PlaylistDTO;
import com.music.musicapp.dto.SongDTO;
import com.music.musicapp.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "*") // FIX: Browser blocking hatane ke liye
public class PlaylistController {
    
    @Autowired
    private PlaylistService playlistService;
    // ==========================================
    // 1. SIMPLE CREATE (Frontend ye use kar raha hai)
    // URL: /api/playlists/create?name=MyPlaylist
    // ==========================================
    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createPlaylistSimple(@RequestParam String name) {
        try {
            // "My Playlist" default description hai
            PlaylistDTO playlist = playlistService.createPlaylist(name, "My Playlist", true, null);
            return ResponseEntity.ok(ApiResponse.success("Playlist created successfully", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    // ==========================================
    // 2. ADVANCED CREATE (JSON Body ke liye - Future Use)
    // URL: /api/playlists (Body: { "name": "..." })
    // ==========================================
    @PostMapping
    public ResponseEntity<ApiResponse> createPlaylistAdvanced(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            Boolean isPublic = (Boolean) request.get("isPublic");
            
            if (isPublic == null) isPublic = true;
            
            PlaylistDTO playlist = playlistService.createPlaylist(name, description, isPublic, null);
            return ResponseEntity.ok(ApiResponse.success("Playlist created", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
    // Get all public playlists
    @GetMapping
    public ResponseEntity<ApiResponse> getAllPublicPlaylists() {
        try {
            List<PlaylistDTO> playlists = playlistService.getAllPublicPlaylists();
            return ResponseEntity.ok(
                ApiResponse.success("Public playlists retrieved successfully", playlists)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting playlists: " + e.getMessage()));
        }
    }
    

    // Get playlist by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getPlaylistById(@PathVariable Long id) {
        try {
            PlaylistDTO playlist = playlistService.getPlaylistById(id);
            return ResponseEntity.ok(
                ApiResponse.success("Playlist retrieved successfully", playlist)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // Add song to playlist
    @PostMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<ApiResponse> addSongToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long songId) {
        try {
            PlaylistDTO playlist = playlistService.addSongToPlaylist(playlistId, songId);
            return ResponseEntity.ok(
                ApiResponse.success("Song added to playlist successfully", playlist)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Remove song from playlist
    @DeleteMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<ApiResponse> removeSongFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long songId) {
        try {
            PlaylistDTO playlist = playlistService.removeSongFromPlaylist(playlistId, songId);
            return ResponseEntity.ok(
                ApiResponse.success("Song removed from playlist successfully", playlist)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get songs in a playlist
    @GetMapping("/{id}/songs")
    public ResponseEntity<ApiResponse> getSongsInPlaylist(@PathVariable Long id) {
        try {
            List<SongDTO> songs = playlistService.getSongsInPlaylist(id);
            return ResponseEntity.ok(
                ApiResponse.success("Songs in playlist retrieved successfully", songs)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    // Delete playlist
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.ok(ApiResponse.success("Playlist deleted", null));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchPlaylistsByName(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Search results", playlistService.searchPlaylistsByName(name)));
    }
}