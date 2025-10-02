# Matching Service

## Overview

The **Matching Service** is responsible for pairing users in PeerPrep based on selected topic, difficulty, and programming language. It manages user queues, handles match creation, and communicates with other services such as:

- **User Service**
- **Question Service**
- **Collaboration Service**

This service is built using **FastAPI** and is designed to be **containerised using Docker**.

---

## Features

- Join a match queue for a specific topic, difficulty, and programming language
- Automatic peer matching from the queue
- Cancel a queue request
- Integration points for collaboration sessions
- Health check endpoint for service monitoring

---

## API Testing with Postman

A **Postman collection** is provided to test the Matching Service:

1. Open Postman -> Import -> File -> `postman/PeerPrep.postman_collection.json`
2. The collection includes:
   - Join queue (`/match/request`)
   - Cancel queue (`/match/cancel`)
3. Update environment variables if needed (e.g., `url`)

---

## WebSocket Testing

To test real-time events such as match found or timeout:

1. Open Postman -> New -> WebSocket Request
2. URL: `ws://localhost:8000/match/ws/{{user_id}}`
3. Replace `{{user_id}}` with your test user
4. Click **Connect**
5. To simulate events:
   - POST `/match/request` from **user 1** and **user 2** to trigger `match.found`
   - POST `/match/request` to trigger `match.timeout` if no peer is found within 60 seconds

---

## Running the service

### Using Make

From the `matching-service` folder, run:

```bash
make run
```
