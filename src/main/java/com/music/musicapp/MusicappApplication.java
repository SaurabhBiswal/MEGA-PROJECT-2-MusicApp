package com.music.musicapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class MusicappApplication {
    public static void main(String[] args) {
        SpringApplication.run(MusicappApplication.class, args);
        System.out.println("🎵 MUSIC APP IS RUNNING... TRUST THE PROCESS! 🚀");
    }
}