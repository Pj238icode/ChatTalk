# ChatTalk

ChatTalk is a modern real-time chat application built using **Spring Boot**, **React**, and **Tailwind CSS**. It provides instant messaging, real-time notifications, and file-sharing capabilities with support for PDFs and images. Users can also edit their profiles and customize their information.  

## Features

- **Real-Time Messaging:** Powered by WebSockets for instant message delivery.
- **Notifications:** Receive real-time notifications for new messages and updates.
- **File Sharing:** Users can send files like PDFs and images directly in chat.
- **Profile Management:** Users can edit and update their profile information.
- **Cloud Storage:** Files are stored securely using **AWS S3**.
- **Responsive UI:** Built with **Tailwind CSS** for a clean and mobile-friendly interface.
- **Secure Authentication:** Backend built with Spring Boot security.

## Tech Stack

- **Frontend:** React, Tailwind CSS, WebSockets
- **Backend:** Spring Boot, Spring Security, WebSocket support
- **Database:** MongoDB
- **Cloud Storage:** AWS S3 for file uploads
- **Real-Time Communication:** WebSockets
## Demo


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
4.    

