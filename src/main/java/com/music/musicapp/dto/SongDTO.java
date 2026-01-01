package com.music.musicapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private Integer duration;
    private String audioUrl;
    
    // IS LINE KO ADD KARO AGAR MISSING HAI
    private String albumArtUrl; 
    
    private Integer releaseYear;
    private LocalDateTime uploadedAt;
    private Long uploaderId;
    private Double averageRating;
    private Integer ratingCount;
    private Integer playCount;
    private Boolean isOfflineAvailable;
}