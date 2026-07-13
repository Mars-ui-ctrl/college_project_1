# Research Nexus - System Architecture

This document describes the design architecture of **Research Nexus**, a high-performance research platform built on React, Express, MongoDB, and Gemini API.

---

## Architecture Overview

Research Nexus is designed using a **Decoupled Three-Tier Architecture** consisting of:
1.  **Presentation Layer**: React (latest) + Vite, using Tailwind CSS v4, Framer Motion, and `@xyflow/react`.
2.  **Controller & Security Layer**: Express routing, request validation via `express-validator`, rate limiting, Helmet, and error normalization.
3.  **Core Services Layer (Business Logic)**: Clean service adapters that handle data queries, external API communications (Google Gemini API, Cloudinary), and state aggregation.

---

## Backend Design (Decoupled Service Model)

To keep code DRY and maintainable, business operations are separated from controllers:

*   **Controllers** (`backend/controllers/`): Handle Express req/res. Perform input sanitization and delegate operation to services. Return structured, standard response formats.
*   **Services** (`backend/services/`): Host core logic. Query Database schemas directly. Interact with external wrappers (Cloudinary uploads, Gemini client).

### AI Sub-Services (`backend/services/ai/`)
*   `summarizationService.js`: Parses text and extracts structured summary JSON.
*   `chatService.js`: Stores conversations in databases and calls Gemini history models.
*   `quizService.js`: Auto-creates quizzes based on paper content.
*   `flashcardService.js`: Formulates flashcard decks and sets Spaced Repetition parameters.
*   `comparisonService.js`: Summarizes and cross-analyzes two papers into a comparison matrix.
*   `conceptService.js`: Identifies concepts and links for the interactive Graph model.
*   `citationService.js`: Formats bibliographies in APA, MLA, IEEE, and validates DOIs.

---

## PDF Processing Pipeline

```
+------------+       +------------+       +------------+       +---------------+
| PDF Upload | ----> | Validation | ----> | Cloudinary | ----> | Local Parsing |
+------------+       +------------+       +------------+       +---------------+
                                                                       |
+------------+       +------------+       +------------+       +---------------+
| Graph & DB | <---- | AI Summary | <---- | Chunking   | <---- | Text Extractor|
+------------+       +------------+       +------------+       +---------------+
```

1.  **Upload**: Client sends PDF. `Multer` accepts request.
2.  **Validation**: Verifies type `application/pdf` and file size.
3.  **Cloud Upload**: Streamed directly to Cloudinary.
4.  **Local Parsing**: `pdf-parse` reads buffer to extract raw text blocks.
5.  **Chunking**: Chunks text (2000 words, 200 overlap) to fit LLM window constraints.
6.  **AI Summary**: Chunks processed to form structured Abstract, Key Points, Methodology, Results, Limitations, Future Work, Keywords.
7.  **Graph & DB**: Saved to DB; concepts extracted and mapped to `@xyflow/react` node layout.

---

## Modular Export Adapters (`backend/services/export/`)

Uses the **Adapter Pattern** to orchestrate file serialization.
*   `export/index.js`: Exporter controller that calls registered adapters.
*   `pdfAdapter.js` / `docxAdapter.js` / `mdAdapter.js`: Write output buffers.
*   `jsonAdapter.js` / `bibtexAdapter.js`: Structure metadata details.
