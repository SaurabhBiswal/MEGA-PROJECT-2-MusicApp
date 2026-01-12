package com.music.musicapp.controller;

import com.music.musicapp.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/stream")
@CrossOrigin(origins = "*")
public class StreamController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // UPLOAD AUDIO FILE
    @PostMapping("/upload")
    public ResponseEntity<?> uploadAudioFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"success\": false, \"message\": \"File is empty\"}");
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest().body("{\"success\": false, \"message\": \"Only audio files are allowed\"}");
            }
            
            // Store file
            String filename = fileStorageService.storeFile(file);
            
            // Return success response with filename
            return ResponseEntity.ok()
                .body("{\"success\": true, \"message\": \"File uploaded successfully\", \"filename\": \"" + filename + "\"}");
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"success\": false, \"message\": \"Failed to upload file: " + e.getMessage() + "\"}");
        }
    }
    
    // STREAM AUDIO FILE (with Range headers support)
    @GetMapping("/audio/{filename}")
    public ResponseEntity<Resource> streamAudio(@PathVariable String filename,
                                                @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            // Check if file exists
            if (!fileStorageService.fileExists(filename)) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = fileStorageService.getFilePath(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get file length
            long fileLength = resource.contentLength();
            
            // Prepare response headers
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, "audio/mpeg");
            headers.add(HttpHeaders.ACCEPT_RANGES, "bytes");
            
            // Handle Range header for seeking
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String range = rangeHeader.substring(6);
                String[] ranges = range.split("-");
                
                long start = Long.parseLong(ranges[0]);
                long end = fileLength - 1;
                
                if (ranges.length > 1 && !ranges[1].isEmpty()) {
                    end = Long.parseLong(ranges[1]);
                }
                
                // Validate range
                if (start > end || start < 0 || end >= fileLength) {
                    return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileLength)
                        .build();
                }
                
                // Partial content response
                long contentLength = end - start + 1;
                headers.add(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileLength);
                headers.setContentLength(contentLength);
                
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .body(resource);
            } else {
                // Full file response
                headers.setContentLength(fileLength);
                return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
            }
            
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET FILE INFO (metadata) - SIMPLIFIED VERSION
    @GetMapping("/info/{filename}")
    public ResponseEntity<?> getFileInfo(@PathVariable String filename) {
        try {
            if (!fileStorageService.fileExists(filename)) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = fileStorageService.getFilePath(filename);
            
            // Get file size
            long fileSize = 0;
            try {
                fileSize = Files.size(filePath);
            } catch (IOException e) {
                fileSize = -1; // Could not determine size
            }
            
            // Simple metadata
            return ResponseEntity.ok()
                .body("{\"filename\": \"" + filename + 
                     "\", \"size\": " + fileSize + 
                     ", \"contentType\": \"audio/mpeg\"}");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"success\": false, \"message\": \"Error getting file info: " + e.getMessage() + "\"}");
        }
    }
    
    // Sample audio endpoint for testing
    @GetMapping("/sample")
    public ResponseEntity<Resource> getSampleAudio() {
        try {
            // Try to find any audio file in uploads directory
            Path uploadPath = fileStorageService.getFilePath("");
            
            // If no files uploaded, return a simple message
            if (!Files.exists(uploadPath) || Files.list(uploadPath).count() == 0) {
                // Create a simple test response
                String testMessage = "No audio files uploaded yet. Please upload an MP3 file.";
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .body(new org.springframework.core.io.ByteArrayResource(testMessage.getBytes()));
            }
            
            // Get first file from uploads
            java.util.Optional<Path> firstFile = Files.list(uploadPath).findFirst();
            if (firstFile.isPresent()) {
                Path samplePath = firstFile.get();
                Resource resource = new UrlResource(samplePath.toUri());
                
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .body(resource);
            }
            
            return ResponseEntity.notFound().build();
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // List uploaded audio files
    @GetMapping("/list")
    public ResponseEntity<?> listAudioFiles() {
        try {
            Path uploadPath = fileStorageService.getFilePath("");
            
            if (!Files.exists(uploadPath)) {
                return ResponseEntity.ok()
                    .body("{\"files\": [], \"message\": \"Upload directory does not exist\"}");
            }
            
            java.util.List<String> files = Files.list(uploadPath)
                .map(path -> path.getFileName().toString())
                .filter(filename -> filename.toLowerCase().endsWith(".mp3") || 
                                   filename.toLowerCase().endsWith(".wav") ||
                                   filename.toLowerCase().endsWith(".ogg"))
                .toList();
            
            return ResponseEntity.ok()
                .body("{\"files\": " + files.toString() + ", \"count\": " + files.size() + "}");
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"success\": false, \"message\": \"Error listing files: " + e.getMessage() + "\"}");
        }
    }
}