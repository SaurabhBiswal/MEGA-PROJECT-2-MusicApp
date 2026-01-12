package com.music.musicapp.controller;

import com.music.musicapp.dto.ApiResponse;
import com.music.musicapp.service.ImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "*")
public class ImportController {
    
    @Autowired
    private ImportService importService;
    
    // Get available import services
    @GetMapping("/services")
    public ResponseEntity<ApiResponse> getServices() {
        try {
            List<Map<String, Object>> services = importService.getAvailableServices();
            return ResponseEntity.ok(
                ApiResponse.success("Available import services", services)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting services: " + e.getMessage()));
        }
    }
    
    // Connect to service
    @PostMapping("/services/{serviceId}/connect")
    public ResponseEntity<ApiResponse> connectService(
            @PathVariable String serviceId,
            @RequestBody Map<String, String> credentials) {
        try {
            Map<String, Object> result = importService.connectService(serviceId, credentials);
            return ResponseEntity.ok(
                ApiResponse.success("Service connection result", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error connecting service: " + e.getMessage()));
        }
    }
    
    // Import from service (track or playlist)
    @PostMapping("/services/{serviceId}/import")
    public ResponseEntity<ApiResponse> importFromService(
            @PathVariable String serviceId,
            @RequestBody Map<String, Object> importData) {
        try {
            String itemId = (String) importData.get("itemId");
            String itemType = (String) importData.get("type"); // "track" or "playlist"
            Map<String, String> options = (Map<String, String>) importData.get("options");
            
            if (itemId == null || itemId.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Item ID is required"));
            }
            
            Map<String, Object> result = importService.importFromService(serviceId, itemId, options);
            return ResponseEntity.ok(
                ApiResponse.success("Import result", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error importing: " + e.getMessage()));
        }
    }
    
    // Get import history
    @GetMapping("/history")
    public ResponseEntity<ApiResponse> getImportHistory(
            @RequestParam(required = false) String serviceId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> history = importService.getImportHistory(serviceId, limit);
            return ResponseEntity.ok(
                ApiResponse.success("Import history", history)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting history: " + e.getMessage()));
        }
    }
    
    // Disconnect service
    @DeleteMapping("/services/{serviceId}/disconnect")
    public ResponseEntity<ApiResponse> disconnectService(@PathVariable String serviceId) {
        try {
            Map<String, Object> result = importService.disconnectService(serviceId);
            return ResponseEntity.ok(
                ApiResponse.success("Disconnect result", result)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error disconnecting service: " + e.getMessage()));
        }
    }
    
    // Get import statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getImportStats() {
        try {
            Map<String, Object> stats = importService.getImportStats();
            return ResponseEntity.ok(
                ApiResponse.success("Import statistics", stats)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error getting stats: " + e.getMessage()));
        }
    }
    
    // Search across services
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchServices(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> results = importService.searchAllServices(query, limit);
            return ResponseEntity.ok(
                ApiResponse.success("Cross-service search results", results)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error searching services: " + e.getMessage()));
        }
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(
            ApiResponse.success("Import API is working", Map.of("status", "healthy"))
        );
    }
    @GetMapping("/test")
public ResponseEntity<ApiResponse> testEndpoint() {
    try {
        // Test if service is working
        List<Map<String, Object>> services = importService.getAvailableServices();
        Map<String, Object> testResult = new HashMap<>();
        testResult.put("status", "OK");
        testResult.put("serviceCount", services.size());
        testResult.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(
            ApiResponse.success("Import service is working", testResult)
        );
    } catch (Exception e) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Test failed: " + e.getMessage()));
    }
}
}