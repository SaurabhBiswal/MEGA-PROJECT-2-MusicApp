package com.music.musicapp.service;
import java.util.Map;
import com.music.musicapp.dto.SongDTO;
import com.music.musicapp.model.Song;
import com.music.musicapp.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils; // Zaroori Import
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.web.client.RestTemplate;
@Service
public class SongService {
    
    @Autowired
    private SongRepository songRepository;
    private final Path fileStorageLocation;
    // Constructor: Ye folder create karega jab app start hoga
    public SongService() {
        this.fileStorageLocation = Paths.get("uploads/audio").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    // --- YE METHOD MISSING THA (Isko dhyan se add karo) ---
    public SongDTO saveSong(String title, String artist, String album, MultipartFile file) throws IOException {
        // 1. File ka naam saaf karo
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        // 2. File name mein invalid characters check karo
        if(fileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
        }

        // 3. File ko 'uploads/audio' folder mein copy karo
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // 4. Database object banao
        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setAlbum(album);
        song.setFilePath(fileName); // Database mein sirf naam save hoga
        song.setAudioUrl("/api/songs/play/" + fileName);
        // 5. Save karo
        Song savedSong = songRepository.save(song);
        
        // 6. DTO return karo
        return convertToDTO(savedSong);
    }
    public List<SongDTO> getAllSongs() {
        return songRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public SongDTO getSongById(Long id) {
        Optional<Song> songOpt = songRepository.findById(id);
        if (songOpt.isEmpty()) {
            throw new RuntimeException("Song not found with ID: " + id);
        }
        return convertToDTO(songOpt.get());
    }
    
    public List<SongDTO> searchByTitle(String title) {
        return songRepository.findByTitleContainingIgnoreCase(title).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<SongDTO> searchByArtist(String artist) {
        return songRepository.findByArtistContainingIgnoreCase(artist).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<SongDTO> getSongsByGenre(String genre) {
        return songRepository.findByGenreContainingIgnoreCase(genre).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<SongDTO> getSongsByAlbum(String album) {
        return songRepository.findByAlbumContainingIgnoreCase(album).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<SongDTO> getRecentSongs(int limit) {
        return songRepository.findByOrderByUploadedAtDesc().stream()
            .limit(limit)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public SongDTO updateSongFilePath(Long songId, String audioFilePath) {
        Optional<Song> songOpt = songRepository.findById(songId);
        if (songOpt.isEmpty()) {
            throw new RuntimeException("Song not found with ID: " + songId);
        }
        Song song = songOpt.get();
        song.setAudioUrl(audioFilePath); // Fixed: Use audioUrl instead of audioFilePath
        Song updatedSong = songRepository.save(song);
        return convertToDTO(updatedSong);
    }
    
    public List<SongDTO> getSongsWithAudio() {
        return songRepository.findAll().stream()
            .filter(song -> song.getAudioUrl() != null && !song.getAudioUrl().isEmpty())
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
   public List<SongDTO> searchExternalSongs(String query) {
    String sanitizedQuery = query.replace(" ", "%20");
    String url = "https://itunes.apple.com/search?term=" + sanitizedQuery + "&entity=song&limit=10";
    
    RestTemplate restTemplate = new RestTemplate();

    // ERROR FIX: text/javascript ko handle karne ke liye converter
    org.springframework.http.converter.json.MappingJackson2HttpMessageConverter converter = 
        new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter();
    converter.setSupportedMediaTypes(java.util.Collections.singletonList(
        new org.springframework.http.MediaType("text", "javascript", java.nio.charset.StandardCharsets.UTF_8)));
    restTemplate.getMessageConverters().add(0, converter);

    try {
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        
        if (response == null || !response.containsKey("results")) {
            return java.util.Collections.emptyList();
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
        
        return results.stream().map(item -> {
            SongDTO dto = new SongDTO();
            dto.setTitle((String) item.get("trackName"));
            dto.setArtist((String) item.get("artistName"));
            dto.setAlbum((String) item.get("collectionName"));
            dto.setAudioUrl((String) item.get("previewUrl")); 
            dto.setAlbumArtUrl((String) item.get("artworkUrl100"));
            return dto;
        }).collect(java.util.stream.Collectors.toList());
        
    } catch (Exception e) {
        System.err.println("API Error: " + e.getMessage());
        return java.util.Collections.emptyList();
    }
}
    
    public SongDTO convertToDTO(Song song) {
        return new SongDTO(
            song.getId(),
            song.getTitle(),
            song.getArtist(),
            song.getAlbum(),
            song.getGenre(),
            song.getDuration(),
            song.getAudioUrl(),
            song.getAlbumArtUrl(),
            song.getReleaseYear(),
            song.getUploadedAt(),
            song.getUploaderId(),
            song.getAverageRating(),
            song.getRatingCount(),
            song.getPlayCount(),
            song.getIsOfflineAvailable()
        );
    }
    
    // NEW: Search songs by query (title, artist, or album)
    public List<SongDTO> searchSongs(String query) {
        return songRepository.searchSongs(query).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // NEW: Get trending songs
    public List<SongDTO> getTrendingSongs(int limit) {
        return songRepository.findByOrderByPlayCountDesc().stream()
            .limit(limit)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}