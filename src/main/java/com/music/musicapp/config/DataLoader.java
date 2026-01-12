package com.music.musicapp.config;

import com.music.musicapp.model.Playlist;
import com.music.musicapp.model.Song;
import com.music.musicapp.model.User;
import com.music.musicapp.repository.PlaylistRepository;
import com.music.musicapp.repository.SongRepository;
import com.music.musicapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private SongRepository songRepository;
    
    @Autowired
    private PlaylistRepository playlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Initializing Music Player App...");
        
        // 1. Create uploads folder if it doesn't exist
        File uploadsDir = new File("uploads/audio");
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
            System.out.println("✅ Created uploads/audio directory");
        }
        
        // 2. Create dummy sample.mp3 file if it doesn't exist
        File sampleFile = new File("uploads/audio/sample.mp3");
        if (!sampleFile.exists()) {
            try {
                Files.write(Paths.get("uploads/audio/sample.mp3"), 
                    "This is a dummy MP3 file for testing. Replace with real MP3.".getBytes());
                System.out.println("✅ Created dummy sample.mp3 in uploads/audio/");
            } catch (Exception e) {
                System.out.println("⚠️ Could not create sample.mp3: " + e.getMessage());
            }
        }
        
        // 3. Create default user if not exists
        User defaultUser = null;
        if (userRepository.count() == 0) {
            defaultUser = new User();
            defaultUser.setUsername("admin");
            defaultUser.setEmail("admin@musicapp.com");
            defaultUser.setPassword("admin123");
            defaultUser.setFullName("Admin User");
            defaultUser.setCreatedAt(LocalDateTime.now());
            defaultUser.setUpdatedAt(LocalDateTime.now());
            defaultUser.setActive(true);
            // ✅ ADD ROLE FOR ADMIN
            defaultUser.setRole("ADMIN");
            defaultUser = userRepository.save(defaultUser);
            System.out.println("✅ Created default admin user with ADMIN role");
        } else {
            defaultUser = userRepository.findAll().get(0);
            // ✅ UPDATE EXISTING USERS WITH ROLES
            updateExistingUsersWithRole();
        }
        
        // 4. Add sample songs to database if empty
        if (songRepository.count() == 0) {
            try {
                // Song 1: The Weeknd
                Song song1 = new Song();
                song1.setTitle("Blinding Lights");
                song1.setArtist("The Weeknd");
                song1.setAlbum("After Hours");
                song1.setReleaseYear(2020);
                song1.setDuration(200);
                song1.setAudioUrl("/api/stream/audio/sample.mp3");
                song1.setGenre("Pop");
                song1.setUploadedAt(LocalDateTime.now().minusDays(5));
                song1.setAlbumArtUrl("https://via.placeholder.com/150/FF6B6B/ffffff?text=BL");
                song1.setPlayCount(1000);
                song1.setAverageRating(4.8);
                song1.setRatingCount(150);
                songRepository.save(song1);
                
                // Song 2: Ed Sheeran
                Song song2 = new Song();
                song2.setTitle("Shape of You");
                song2.setArtist("Ed Sheeran");
                song2.setAlbum("÷ (Divide)");
                song2.setReleaseYear(2017);
                song2.setDuration(234);
                song2.setAudioUrl("/api/stream/audio/sample.mp3");
                song2.setGenre("Pop");
                song2.setUploadedAt(LocalDateTime.now().minusDays(4));
                song2.setAlbumArtUrl("https://via.placeholder.com/150/4ECDC4/ffffff?text=SOY");
                song2.setPlayCount(1500);
                song2.setAverageRating(4.5);
                song2.setRatingCount(200);
                songRepository.save(song2);
                
                // Song 3: Queen
                Song song3 = new Song();
                song3.setTitle("Bohemian Rhapsody");
                song3.setArtist("Queen");
                song3.setAlbum("A Night at the Opera");
                song3.setReleaseYear(1975);
                song3.setDuration(354);
                song3.setAudioUrl("/api/stream/audio/sample.mp3");
                song3.setGenre("Rock");
                song3.setUploadedAt(LocalDateTime.now().minusDays(3));
                song3.setAlbumArtUrl("https://via.placeholder.com/150/FFD166/ffffff?text=BR");
                song3.setPlayCount(2000);
                song3.setAverageRating(4.9);
                song3.setRatingCount(300);
                songRepository.save(song3);
                
                // Song 4: Michael Jackson
                Song song4 = new Song();
                song4.setTitle("Billie Jean");
                song4.setArtist("Michael Jackson");
                song4.setAlbum("Thriller");
                song4.setReleaseYear(1982);
                song4.setDuration(294);
                song4.setAudioUrl("/api/stream/audio/sample.mp3");
                song4.setGenre("Pop");
                song4.setUploadedAt(LocalDateTime.now().minusDays(2));
                song4.setAlbumArtUrl("https://via.placeholder.com/150/06D6A0/ffffff?text=BJ");
                song4.setPlayCount(1800);
                song4.setAverageRating(4.7);
                song4.setRatingCount(250);
                songRepository.save(song4);
                
                // Song 5: Nirvana
                Song song5 = new Song();
                song5.setTitle("Smells Like Teen Spirit");
                song5.setArtist("Nirvana");
                song5.setAlbum("Nevermind");
                song5.setReleaseYear(1991);
                song5.setDuration(301);
                song5.setAudioUrl("/api/stream/audio/sample.mp3");
                song5.setGenre("Rock");
                song5.setUploadedAt(LocalDateTime.now().minusDays(1));
                song5.setAlbumArtUrl("https://via.placeholder.com/150/118AB2/ffffff?text=SLTS");
                song5.setPlayCount(1200);
                song5.setAverageRating(4.6);
                song5.setRatingCount(180);
                songRepository.save(song5);
                
                System.out.println("✅ Added 5 sample songs to database");
                
                // 5. Create sample playlists
                createPlaylists(defaultUser, song1, song2, song3, song4, song5);
                
            } catch (Exception e) {
                System.out.println("⚠️ Could not add sample data: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("✅ Database already has " + songRepository.count() + " songs");
            if (playlistRepository.count() == 0) {
                List<Song> songs = songRepository.findAll();
                if (songs.size() >= 5) {
                    createPlaylists(defaultUser, 
                        songs.get(0), songs.get(1), songs.get(2), songs.get(3), songs.get(4));
                }
            }
        }
        
        System.out.println("🎵 Music App is ready! Total songs in DB: " + songRepository.count());
        System.out.println("📋 Total playlists in DB: " + playlistRepository.count());
        System.out.println("👤 Total users in DB: " + userRepository.count());
    }
    
    // ✅ NEW METHOD: Update existing users with roles
    private void updateExistingUsersWithRole() {
        List<User> users = userRepository.findAll();
        boolean updated = false;
        for (User user : users) {
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
                userRepository.save(user);
                updated = true;
                System.out.println("✅ Updated role for user: " + user.getUsername());
            }
        }
        if (updated) {
            System.out.println("✅ Updated roles for existing users");
        }
    }
    
    private void createPlaylists(User user, Song song1, Song song2, Song song3, Song song4, Song song5) {
        try {
            // Create "Top Hits 2024" playlist
            Playlist playlist1 = new Playlist();
            playlist1.setName("Top Hits 2024");
            playlist1.setDescription("The hottest tracks of 2024");
            playlist1.setPublic(true);
            playlist1.setUser(user);
            playlist1.setCreatedAt(LocalDateTime.now());
            playlist1.setUpdatedAt(LocalDateTime.now());
            playlist1.setSongs(Arrays.asList(song1, song2));
            playlistRepository.save(playlist1);
            
            // Create "Classic Rock Collection" playlist
            Playlist playlist2 = new Playlist();
            playlist2.setName("Classic Rock Collection");
            playlist2.setDescription("Timeless rock classics");
            playlist2.setPublic(true);
            playlist2.setUser(user);
            playlist2.setCreatedAt(LocalDateTime.now());
            playlist2.setUpdatedAt(LocalDateTime.now());
            playlist2.setSongs(Arrays.asList(song3, song5));
            playlistRepository.save(playlist2);
            
            // Create "Pop Favorites" playlist
            Playlist playlist3 = new Playlist();
            playlist3.setName("Pop Favorites");
            playlist3.setDescription("Best pop songs of all time");
            playlist3.setPublic(true);
            playlist3.setUser(user);
            playlist3.setCreatedAt(LocalDateTime.now());
            playlist3.setUpdatedAt(LocalDateTime.now());
            playlist3.setSongs(Arrays.asList(song1, song2, song4));
            playlistRepository.save(playlist3);
            
            // Create "My Mix" playlist (private)
            Playlist playlist4 = new Playlist();
            playlist4.setName("My Mix");
            playlist4.setDescription("Personal favorites");
            playlist4.setPublic(false);
            playlist4.setUser(user);
            playlist4.setCreatedAt(LocalDateTime.now());
            playlist4.setUpdatedAt(LocalDateTime.now());
            playlist4.setSongs(Arrays.asList(song1, song3, song5));
            playlistRepository.save(playlist4);
            
            System.out.println("✅ Added 4 sample playlists to database");
        } catch (Exception e) {
            System.out.println("⚠️ Could not add sample playlists: " + e.getMessage());
            e.printStackTrace();
        }
    }
}