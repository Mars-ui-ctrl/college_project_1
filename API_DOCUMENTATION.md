# Research Nexus - API Documentation

This document describes the REST API endpoints and payloads for **Research Nexus**.

All API routes are prefixed with `/api`. Authenticated endpoints require a valid JWT token sent in a secure cookie.

---

## 1. Authentication (`/api/auth`)

### Register User
*   **Method**: `POST`
*   **Path**: `/register`
*   **Payload**:
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Response**: `201 Created` with secure cookie set.

### Login User
*   **Method**: `POST`
*   **Path**: `/login`
*   **Payload**:
    ```json
    {
      "email": "john@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Response**: `200 OK` with secure cookie set.

### Logout User
*   **Method**: `POST`
*   **Path**: `/logout`
*   **Response**: `200 OK` clearing cookie.

### Get Current User Profile
*   **Method**: `GET`
*   **Path**: `/profile`
*   **Headers**: Cookie `token`
*   **Response**: `200 OK` with profile info.

---

## 2. Research Projects (`/api/projects`)

### List User Projects
*   **Method**: `GET`
*   **Path**: `/`
*   **Response**: `200 OK` returning array of project metadata.

### Create Project
*   **Method**: `POST`
*   **Path**: `/`
*   **Payload**:
    ```json
    {
      "title": "Quantum Computing Research",
      "description": "Analysis of quantum gate noise mitigation"
    }
    ```

---

## 3. Papers & Uploads (`/api/papers`)

### Upload Paper (Multipart FormData)
*   **Method**: `POST`
*   **Path**: `/upload`
*   **Payload**: Form-Data with key `pdf` containing the file and `projectId` String.
*   **Response**: `201 Created` containing parsed text snippets, citations, and summary nodes.

### Delete Paper
*   **Method**: `DELETE`
*   **Path**: `/:id`
*   **Response**: `200 OK` confirming removal.

---

## 4. Notebook & Notes (`/api/notes`)

### Save / Update Note
*   **Method**: `POST`
*   **Path**: `/`
*   **Payload**:
    ```json
    {
      "projectId": "project_id_here",
      "paperId": "optional_paper_id",
      "title": "Methodology Analysis",
      "content": "Markdown text here...",
      "type": "markdown",
      "color": "#fffb8f"
    }
    ```

### Delete Note
*   **Method**: `DELETE`
*   **Path**: `/:id`
*   **Response**: `200 OK`.

---

## 5. Quiz & Flashcards

### Generate Quiz (AI Powered)
*   **Method**: `POST`
*   **Path**: `/quizzes/generate`
*   **Payload**:
    ```json
    {
      "paperId": "paper_id_here",
      "difficulty": "medium",
      "format": "mcq"
    }
    ```

### Generate Flashcards (AI Powered)
*   **Method**: `POST`
*   **Path**: `/flashcards/generate`
*   **Payload**:
    ```json
    {
      "paperId": "paper_id_here"
    }
    ```

---

## 6. Analytics (`/api/analytics`)

### Fetch Project Metrics
*   **Method**: `GET`
*   **Path**: `/projects/:id/dashboard`
*   **Response**: Aggregated event logs for reading streak, heatmap grid, and quiz scores.
