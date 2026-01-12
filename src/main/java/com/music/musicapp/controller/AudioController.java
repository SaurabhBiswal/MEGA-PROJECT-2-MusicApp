package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.dto.SongDTO;
import com.music.musicapp.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "*")
public class AudioController {
    
    @Autowired
    private SongService songService;
    
    @GetMapping("/stream/{id}")
    public ResponseEntity<ApiResponse> streamAudio(@PathVariable Long id) {
        try {
            SongDTO song = songService.getSongById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("streamUrl", "/api/audio/stream/" + id);
            response.put("song", song);
            response.put("message", "Streaming endpoint ready");
            return ResponseEntity.ok(ApiResponse.success("Stream ready", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error streaming audio: " + e.getMessage()));
        }
    }
    
    @GetMapping("/info/{id}")
    public ResponseEntity<ApiResponse> getAudioInfo(@PathVariable Long id) {
        try {
            SongDTO song = songService.getSongById(id);
            Map<String, Object> info = new HashMap<>();
            info.put("id", song.getId());
            info.put("title", song.getTitle());
            info.put("artist", song.getArtist());
            info.put("album", song.getAlbum());
            info.put("duration", song.getDuration() + " seconds");
            info.put("genre", song.getGenre());
            return ResponseEntity.ok(ApiResponse.success("Audio info retrieved", info));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting audio info: " + e.getMessage()));
        }
    }
}