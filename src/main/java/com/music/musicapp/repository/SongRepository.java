package com.music.musicapp.repository;

import com.music.musicapp.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
    
    // Basic find methods
    List<Song> findByReleaseYear(Integer releaseYear);
    List<Song> findByArtist(String artist);
    List<Song> findByTitle(String title);
    List<Song> findByGenre(String genre);
    List<Song> findByArtistAndReleaseYear(String artist, Integer releaseYear);
    
    // Search methods (for service layer)
    List<Song> findByTitleContainingIgnoreCase(String title);
    List<Song> findByArtistContainingIgnoreCase(String artist);
    List<Song> findByAlbumContainingIgnoreCase(String album);
    List<Song> findByGenreContainingIgnoreCase(String genre);  // ADDED
    
    // Sorting methods (for service layer)
    List<Song> findByOrderByPlayCountDesc();  // ADDED
    List<Song> findByOrderByUploadedAtDesc();  // ADDED
    
    // Custom queries (for service layer)
    @Query("SELECT s FROM Song s WHERE s.title LIKE %:keyword% OR s.artist LIKE %:keyword% OR s.album LIKE %:keyword% OR s.genre LIKE %:keyword%")
    List<Song> searchSongs(@Param("keyword") String keyword);  // ADDED
    
    @Query("SELECT s FROM Song s WHERE s.uploadedAt >= :since ORDER BY s.playCount DESC")
    List<Song> findTrendingSince(@Param("since") LocalDateTime since);  // ADDED
    
    @Query("SELECT s FROM Song s ORDER BY s.playCount DESC")
    List<Song> findTopSongs();
    
    @Query("SELECT s FROM Song s WHERE s.averageRating >= :minRating ORDER BY s.averageRating DESC")
    List<Song> findByMinRating(@Param("minRating") Double minRating);
}