# 🎵 MusicApp - Full Stack Music Streaming Platform

A production-ready music streaming application built with Java Spring Boot and React, featuring user authentication, playlist management, and audio streaming capabilities.

## 🚀 Live Deployment
- **Application:** eloquent-souffle-13cf7e.netlify.app
-  https://starlit-lolly-c5ae35.netlify.app
- **Backend API:** https://mega-project-2-musicapp-production.up.railway.app
- **Health Check:** https://mega-project-2-musicapp-production.up.railway.app/api/auth/health

## ✨ Key Features
- **Secure Authentication** - JWT-based user registration and login system
- **Playlist Management** - Create, edit, and organize music playlists
- **Audio Streaming** - Efficient HTTP range requests for seamless playback
- **Song Library** - Browse and search through music catalog
- **Shareable Playlists** - Generate and share playlist links
- **Responsive Design** - Mobile-optimized user interface

## 🛠️ Technology Stack
**Backend:**
- Java 17, Spring Boot 3.x, Spring Security, JPA/Hibernate
- MySQL 8.0, RESTful APIs, JWT Authentication
- Maven, Railway Deployment

**Frontend:**
- React 18, CSS3, HTML5 Audio API
- Axios, React Router, Environment-based Configuration
- Netlify Deployment

**DevOps:**
- Git/GitHub, Multi-environment Deployment
- Railway (Backend), Netlify (Frontend)
- Automated Build & Deployment Pipelines

## 📁 Project Architecture
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ React Frontend│◄──►│ Spring Boot API │◄──►│ MySQL Database│
│ (Netlify) │ │ (Railway) │ │ (Railway) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
Static Hosting RESTful Services Persistent Storage

text

## 🏗️ Setup & Installation

### Prerequisites
- Java 17+, MySQL 8.0+, Maven, Node.js 16+

### Backend Setup
```bash
git clone https://github.com/SaurabhBiswal/MEGA-PROJECT-2-MusicApp.git
cd MEGA-PROJECT-2-MusicApp

# Configure database
mysql -u root -p
CREATE DATABASE musicapp;
CREATE USER 'musicuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON musicapp.* TO 'musicuser'@'localhost';
FLUSH PRIVILEGES;

# Update application.properties
# Set database credentials and JWT secret

# Run application
mvn spring-boot:run
Frontend Setup
bash
cd frontend
npm install
npm start
🔧 Technical Implementation Highlights
Backend
Spring Security with JWT token-based authentication

RESTful API design following industry standards

Database optimization with proper indexing and relationships

CORS configuration for secure cross-origin requests

Error handling with custom response structures

Frontend
Component-based architecture with reusable UI components

State management using React hooks and context

Responsive design with CSS media queries

API integration with error handling and loading states

Deployment
Multi-cloud deployment (Railway + Netlify)

Environment variable management for configuration

CI/CD through Git-based deployments

Production monitoring with health checks

📊 API Endpoints Overview
Category	Method	Endpoint	Description
Auth	POST	/api/auth/register	User registration
Auth	POST	/api/auth/login	User login (JWT)
Songs	GET	/api/songs	List all songs
Songs	GET	/api/songs/{id}/stream	Stream audio
Playlists	GET	/api/playlists	User playlists
Playlists	POST	/api/playlists	Create playlist
Playlists	GET	/api/playlists/{id}/share	Share playlist
🎯 Key Achievements
Built complete full-stack application from design to deployment

Implemented secure authentication with JWT and Spring Security

Solved complex CORS issues in production environment

Optimized audio streaming with HTTP range requests

Deployed to production with zero-downtime updates

🔒 Security Features
Password hashing with BCrypt

JWT token expiration and validation

CORS policy configuration

SQL injection prevention

Environment-specific security settings

📈 Performance Optimizations
Database query optimization

Audio streaming with byte-range support

Frontend code splitting and lazy loading

Efficient state management

Caching strategies

🤝 Contact
Developer: Saurabh Biswal

GitHub: SaurabhBiswal

Project Repository: MEGA-PROJECT-2-MusicApp

This project demonstrates professional full-stack development capabilities with modern technologies and production deployment.
