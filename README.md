# 🎵 MusicApp - Complete Music Streaming Platform

A full-stack music streaming application with user authentication, playlists, songs management, and sharing features.

## 🚀 Live Demo
- **Frontend:** https://starlit-lolly-c5ae35.netlify.app
- **Backend API:** https://mega-project-2-musicapp-production.up.railway.app/api/auth/health

## 📋 Features
✅ User Authentication (Register/Login with JWT)  
✅ Create & Manage Playlists  
✅ Add/Remove Songs from Playlists  
✅ Search Songs  
✅ Share Playlists via URL  
✅ Responsive UI  
✅ RESTful APIs  

## 🛠️ Tech Stack
- **Backend:** Java Spring Boot, Spring Security, JPA/Hibernate
- **Frontend:** React.js, CSS
- **Database:** MySQL
- **Deployment:** Railway (Backend), Netlify (Frontend)
- **Authentication:** JWT Tokens

## 🏗️ Local Development Setup

### Prerequisites
- Java 17+
- MySQL 8.0+
- Maven
- Node.js 16+

### Backend Setup
```bash
# 1. Clone repository
git clone https://github.com/SaurabhBiswal/MEGA-PROJECT-2-MusicApp.git
cd MEGA-PROJECT-2-MusicApp

# 2. Configure database
mysql -u root -p
CREATE DATABASE musicapp;
CREATE USER 'musicuser'@'localhost' IDENTIFIED BY 'musicpass';
GRANT ALL PRIVILEGES ON musicapp.* TO 'musicuser'@'localhost';
FLUSH PRIVILEGES;

# 3. Update application.properties
# Edit: src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/musicapp
spring.datasource.username=musicuser
spring.datasource.password=musicpass

# 4. Run backend
mvn spring-boot:run
# Server starts at: http://localhost:8080
