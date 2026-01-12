package com.music.musicapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "profile_picture")
    private String profilePicture;
    
    @Column(name = "bio", length = 500)
    private String bio;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // ✅ CHANGE THIS: Remove "nullable = false" temporarily
    @Column(name = "role")
    private String role = "USER";

    // User's owned playlists
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Playlist> ownedPlaylists = new ArrayList<>();
    
    // Playlists the user follows
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_followed_playlists",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "playlist_id")
    )
    private List<Playlist> followedPlaylists = new ArrayList<>();
    
    // Users who follow this user
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "followed_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private List<User> followers = new ArrayList<>();
    
    // Users this user is following
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_following", 
        joinColumns = @JoinColumn(name = "follower_id"),
        inverseJoinColumns = @JoinColumn(name = "followed_id")
    )
    private List<User> following = new ArrayList<>();
    
    // User's ratings
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Rating> ratings = new ArrayList<>();
    
    // User's play history
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<PlayHistory> playHistory = new ArrayList<>();
    
    // Constructor without id (for creating new users)
    public User(String username, String email, String password, String fullName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
        this.role = "USER"; // ✅ Set default role in constructor
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) {
            role = "USER"; // ✅ Ensure role is set on creation
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to add a playlist
    public void addPlaylist(Playlist playlist) {
        if (ownedPlaylists == null) {
            ownedPlaylists = new ArrayList<>();
        }
        ownedPlaylists.add(playlist);
        playlist.setUser(this);
    }
    
    // Helper method to remove a playlist
    public void removePlaylist(Playlist playlist) {
        if (ownedPlaylists != null) {
            ownedPlaylists.remove(playlist);
            playlist.setUser(null);
        }
    }
    
    // Helper method to follow a playlist
    public void followPlaylist(Playlist playlist) {
        if (followedPlaylists == null) {
            followedPlaylists = new ArrayList<>();
        }
        if (!followedPlaylists.contains(playlist)) {
            followedPlaylists.add(playlist);
            if (playlist.getFollowers() == null) {
                playlist.setFollowers(new ArrayList<>());
            }
            playlist.getFollowers().add(this);
        }
    }
    
    // Helper method to unfollow a playlist
    public void unfollowPlaylist(Playlist playlist) {
        if (followedPlaylists != null) {
            followedPlaylists.remove(playlist);
            if (playlist.getFollowers() != null) {
                playlist.getFollowers().remove(this);
            }
        }
    }
    
    // Helper method to follow another user
    public void followUser(User userToFollow) {
        if (following == null) {
            following = new ArrayList<>();
        }
        if (!following.contains(userToFollow)) {
            following.add(userToFollow);
            if (userToFollow.getFollowers() == null) {
                userToFollow.setFollowers(new ArrayList<>());
            }
            userToFollow.getFollowers().add(this);
        }
    }
    
    // Helper method to unfollow a user
    public void unfollowUser(User userToUnfollow) {
        if (following != null) {
            following.remove(userToUnfollow);
            if (userToUnfollow.getFollowers() != null) {
                userToUnfollow.getFollowers().remove(this);
            }
        }
    }
}