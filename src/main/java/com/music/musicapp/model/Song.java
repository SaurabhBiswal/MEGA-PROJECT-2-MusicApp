package com.music.musicapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
@Data
public class Song {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "artist")
    private String artist;
    
    @Column(name = "album")
    private String album;
    
    @Column(name = "genre")
    private String genre;
    // --- YE FIELD MISSING THA ---
    private String filePath; // Sirf filename store karega (e.g., "song.mp3")
    
    @Column(name = "duration") // in seconds
    private Integer duration;
    
    @Column(name = "audio_url", length = 1000)
    private String audioUrl;
    
    @Column(name = "album_art_url", length = 1000)
    private String albumArtUrl;
    
    @Column(name = "release_year")
    private Integer releaseYear;
    
    @Column(name = "source") // youtube, spotify, uploaded, etc.
    private String source;
    
    @Column(name = "external_id") // YouTube video ID, Spotify track ID, etc.
    private String externalId;
    
    // Statistics
    @Column(name = "play_count")
    private Integer playCount = 0;
    
    @Column(name = "like_count")
    private Integer likeCount = 0;
    
    @Column(name = "share_count")
    private Integer shareCount = 0;
    
    @Column(name = "download_count")
    private Integer downloadCount = 0;
    
    // Metadata
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "uploader_id")
    private Long uploaderId;
    
    @Column(name = "average_rating")
    private Double averageRating = 0.0;
    
    @Column(name = "rating_count")
    private Integer ratingCount = 0;
    
    @Column(name = "is_explicit")
    private Boolean isExplicit = false;
    
    @Column(name = "is_licensed")
    private Boolean isLicensed = false;
    
    @Column(name = "is_offline_available")
    private Boolean isOfflineAvailable = false;
    
    // Audio metadata
    @Column(name = "file_size") // in bytes
    private Long fileSize;
    
    @Column(name = "file_format")
    private String fileFormat;
    
    @Column(name = "bitrate") // in kbps
    private Integer bitrate;
    
    // Pre-persist
    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
    
    // Helper methods
    public void addRating(Double rating) {
        double total = this.averageRating * this.ratingCount + rating;
        this.ratingCount++;
        this.averageRating = total / this.ratingCount;
    }
    
    public void incrementPlayCount() {
        this.playCount = (this.playCount == null) ? 1 : this.playCount + 1;
    }
}