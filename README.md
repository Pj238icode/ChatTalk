# ChatTalk

ChatTalk is a modern real-time chat application built using **Spring Boot**, **React**, **Tailwind CSS**, **STOMP.js**, and **MongoDB**. It provides instant messaging, message history, real-time notifications, and file-sharing capabilities with support for PDFs and images. Users can also edit their profiles and customize their information.  

## Live Demo

Check out the live demo here: [ChatTalk Live](https://chattalk1.netlify.app/)  

## Features

- **Real-Time Messaging:** Powered by **WebSockets** and **STOMP.js** for instant message delivery.
- **Message History:** All chat messages are stored in **MongoDB** for persistent history.
- **Notifications:** Receive real-time notifications for new messages and updates.
- **File Sharing:** Users can send files like PDFs and images directly in chat.
- **Profile Management:** Users can edit and update their profile information.
- **Cloud Storage:** Files are stored securely using **AWS S3**.
- **Responsive UI:** Built with **Tailwind CSS** for a clean and mobile-friendly interface.
- **Secure Authentication:** Backend built with Spring Boot security.

## Tech Stack

- **Frontend:** React, Tailwind CSS, STOMP.js, WebSockets
- **Backend:** Spring Boot, Spring Security, WebSocket support
- **Database:** MongoDB for storing message history
- **Cloud Storage:** AWS S3 for file uploads
- **Real-Time Communication:** WebSockets + STOMP.js

## Demo


https://github.com/user-attachments/assets/b0d820ad-e415-4bb4-a9db-955d6db938e0



## Installation & Setup

### Backend

1. Clone the repository:
   ```bash
   git clone https://github.com/Pj238icode/ChatTalk.git
   cd backend
2. Configure your environment variables (application.properties or .env) for database and AWS S3 credentials.
3. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
2. Install dependencies:
   ```bash
   npm install
3. Start the React app:
   ```bash
   npm run dev

