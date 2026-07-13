# Research Nexus - Database Schema

This document details the MongoDB collections and Mongoose schema definitions.

---

## 1. User Schema (`backend/models/User.js`)
Tracks accounts, gamified levels, XP progress, and reading statistics.

*   `username`: String (Unique, required)
*   `email`: String (Unique, required)
*   `password`: String (Hashed, required)
*   `avatar`: String (URL)
*   `xp`: Number (Default: `0`)
*   `level`: Number (Default: `1`)
*   `badges`: Array of Strings (Default: `[]`)
*   `readingStreak`: Number (Default: `0`)
*   `lastReadDate`: Date
*   `createdAt`: Date

---

## 2. ResearchProject Schema (`backend/models/ResearchProject.js`)
Groups related resources (papers, notes, quizzes, etc.) under an isolated workspace structure.

*   `title`: String (Required)
*   `description`: String
*   `owner`: ObjectId (Ref: `User`, Required)
*   `papers`: [ObjectId] (Ref: `Paper`, Default: `[]`)
*   `chats`: [ObjectId] (Ref: `Chat`, Default: `[]`)
*   `notes`: [ObjectId] (Ref: `Note`, Default: `[]`)
*   `quizzes`: [ObjectId] (Ref: `Quiz`, Default: `[]`)
*   `flashcards`: [ObjectId] (Ref: `Flashcard`, Default: `[]`)
*   `createdAt`: Date

---

## 3. Paper Schema (`backend/models/Paper.js`)
Contains parsed PDF files and their AI summaries.

*   `projectId`: ObjectId (Ref: `ResearchProject`, Required)
*   `title`: String (Required)
*   `authors`: [String]
*   `abstract`: String
*   `url`: String (Cloudinary URL, Required)
*   `cloudinaryId`: String (Required)
*   `owner`: ObjectId (Ref: `User`, Required)
*   `summary`: Object
    *   `keyPoints`: [String]
    *   `methodology`: String
    *   `results`: String
    *   `limitations`: String
    *   `futureWork`: String
    *   `keywords`: [String]
*   `doi`: String
*   `citationCount`: Number (Default: `0`)
*   `citations`: Object
    *   `apa`: String
    *   `mla`: String
    *   `ieee`: String
*   `concepts`: [Object] (Graph Nodes: `id`, `label`, `type`, `importance`)
*   `relationships`: [Object] (Graph Edges: `source`, `target`, `type`, `description`)
*   `createdAt`: Date

---

## 4. Chat Schema (`backend/models/Chat.js`)
Tracks conversations.

*   `projectId`: ObjectId (Ref: `ResearchProject`)
*   `paperId`: ObjectId (Ref: `Paper`, Optional)
*   `userId`: ObjectId (Ref: `User`, Required)
*   `title`: String
*   `messages`: [Object]
    *   `sender`: String (Enum: `['user', 'ai']`)
    *   `text`: String
    *   `timestamp`: Date (Default: `Date.now`)
*   `createdAt`: Date

---

## 5. Note Schema (`backend/models/Note.js`)
Supports markdown, stickies, and voice logs.

*   `projectId`: ObjectId (Ref: `ResearchProject`, Required)
*   `paperId`: ObjectId (Ref: `Paper`, Optional)
*   `userId`: ObjectId (Ref: `User`, Required)
*   `title`: String (Required)
*   `content`: String (Markdown text)
*   `type`: String (Enum: `['markdown', 'sticky', 'voice']`)
*   `voiceUrl`: String (For audio attachments)
*   `color`: String (Hex code for stickies)
*   `position`: Object (For stickies: `x`, `y` coordinates)
*   `createdAt`: Date
*   `updatedAt`: Date

---

## 6. Quiz Schema (`backend/models/Quiz.js`)
Evaluations auto-generated from uploaded research.

*   `projectId`: ObjectId (Ref: `ResearchProject`, Required)
*   `paperId`: ObjectId (Ref: `Paper`, Required)
*   `userId`: ObjectId (Ref: `User`, Required)
*   `questions`: [Object]
    *   `question`: String
    *   `type`: String (Enum: `['mcq', 'tf', 'fill', 'short']`)
    *   `options`: [String] (For MCQ)
    *   `correctAnswer`: String
    *   `explanation`: String
*   `score`: Number (Default: `0`)
*   `maxScore`: Number
*   `difficulty`: String (Enum: `['easy', 'medium', 'hard']`)
*   `createdAt`: Date

---

## 7. Flashcard Schema (`backend/models/Flashcard.js`)
Study items with basic spaced repetition parameters.

*   `projectId`: ObjectId (Ref: `ResearchProject`, Required)
*   `paperId`: ObjectId (Ref: `Paper`, Required)
*   `userId`: ObjectId (Ref: `User`, Required)
*   `front`: String (Term/Question)
*   `back`: String (Definition/Answer)
*   `isFavorite`: Boolean (Default: `false`)
*   `box`: Number (Spaced Repetition Box, Default: `1`)
*   `nextReview`: Date (Default: `Date.now`)
*   `createdAt`: Date

---

## 8. AnalyticsEvent Schema (`backend/models/AnalyticsEvent.js`)
Audit log of all user activities for heatmap rendering and dashboard analytics.

*   `userId`: ObjectId (Ref: `User`, Required)
*   `projectId`: ObjectId (Ref: `ResearchProject`)
*   `eventType`: String (Enum: `['PAPER_UPLOADED', 'PAPER_READ', 'QUIZ_ATTEMPTED', 'FLASHCARD_REVIEWED', 'STUDY_SESSION']`)
*   `details`: Object (e.g. `{ paperId, score, durationSeconds, pagesRead }`)
*   `createdAt`: Date (Default: `Date.now`)
