Matching Service
Overview
The Matching Service is responsible for pairing users in PeerPrep based on selected topic, difficulty, and programming language. It manages user queues, handles match creation, and communicates with other services (User Service, Question Service, Collaboration Service).

This service is built using FastAPI and is designed to be containerised using Docker.

Features

- Join a match queue for a specific topic, difficulty, and programming language
- Automatic peer matching from the queue
- Cancel a queue request
- Integration points for collaboration sessions
- Health check endpoint for service monitoring
