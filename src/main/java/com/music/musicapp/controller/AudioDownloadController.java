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
@RequestMapping("/api/download")
@CrossOrigin(origins = "*")
public class AudioDownloadController {
    
    @Autowired
    private SongService songService;
    
    @PostMapping("/prepare/{songId}")
    public ResponseEntity<ApiResponse> prepareDownload(@PathVariable Long songId) {
        try {
            SongDTO song = songService.getSongById(songId);
            Map<String, Object> response = new HashMap<>();
            response.put("downloadId", "download_" + System.currentTimeMillis());
            response.put("songId", songId);
            response.put("songTitle", song.getTitle());
            response.put("artist", song.getArtist());
            response.put("status", "preparing");
            response.put("estimatedTime", "30 seconds");
            response.put("fileSize", "5.2 MB");
            return ResponseEntity.ok(ApiResponse.success("Download prepared", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error preparing download: " + e.getMessage()));
        }
    }
    
    @GetMapping("/status/{downloadId}")
    public ResponseEntity<ApiResponse> checkDownloadStatus(@PathVariable String downloadId) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("downloadId", downloadId);
            response.put("progress", 100);
            response.put("status", "ready");
            response.put("downloadUrl", "/api/download/file/" + downloadId);
            response.put("expiresIn", "24 hours");
            return ResponseEntity.ok(ApiResponse.success("Download status", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error checking status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/file/{downloadId}")
    public ResponseEntity<ApiResponse> downloadFile(@PathVariable String downloadId) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("downloadId", downloadId);
            response.put("fileUrl", "https://example.com/songs/sample.mp3");
            response.put("filename", "song_" + downloadId + ".mp3");
            response.put("contentType", "audio/mpeg");
            return ResponseEntity.ok(ApiResponse.success("Download file info", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting file: " + e.getMessage()));
        }
    }
}