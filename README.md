# Run with Docker

<<<<<<< HEAD
docker-compose up --build
=======
A full-stack web application that allows users to compare grocery prices across multiple supermarkets in real time, helping them make smarter and more cost-effective shopping decisions.

Features:

Compare product prices across multiple supermarkets
Real-time price updates using WebSockets (Socket.IO)
Advanced filtering and search functionality
Product aggregation and price comparison logic
Create and manage shopping lists
Multilingual support (English / Greek)
Scalable backend with RESTful API

Tech Stack:

Frontend:
React
TypeScript
CSS

Backend:
Node.js
Express.js
PostgreSQL
Prisma ORM
Real-Time & DevOps
Socket.IO
Docker
Web scraping & scheduled jobs

Architecture Overview

The application follows a modular full-stack architecture:

Frontend: React-based UI with dynamic filtering and state management
Backend: RESTful API handling business logic and data processing
Database: PostgreSQL with Prisma ORM
Real-Time Layer: WebSockets for live price updates
Data Collection: Automated scraping and scheduled background jobs

Project Structure
client/         # React frontend
server/         # Node.js backend
prisma/         # Database schema & migrations
sockets/        # Real-time communication logic
jobs/           # Scheduled scraping tasks

Key Functionalities:

Real-time price comparison across stores
Aggregation of product data
Smart filtering (price, category, store)
Dynamic updates without page reload
>>>>>>> 63aada3907d73e166dbc99e9b999a2d9204fa922

>>>>>>> 5815c085b0bd0d0399d914d88afc33acb113f5d5
