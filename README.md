# Research Nexus - AI Research Assistant

Research Nexus is a production-quality, AI-powered research platform featuring text summarization, Q&A chat memory, dynamic Knowledge Graphs, automated quiz evaluations, and spacing flashcard drills, built with React (React 19), Node.js, MongoDB, and the Google Gemini API.

---

## 🚀 Key Features

*   **Integrated Workspaces**: Group publications, flashcards, notebooks, and chat sessions by project boundaries.
*   **PDF Pipeline**: Extract text from academic PDFs, extract DOIs, and generate formatted bibliography citations (APA, MLA, IEEE).
*   **Dynamic Knowledge Graph**: Multi-node map visualizing the connections between research terms and documents (via `@xyflow/react`).
*   **AI Experiment Lab**: Compare methodologies, datasets, novelties, and findings from two papers side-by-side using Gemini.
*   **Comprehension Quizzes & Flashcards**: Spaced repetition flashcards (Leitner interval boxes) and auto-graded academic quizzes.
*   **Collaborative Notebooks**: Digital draggable sticky notes and markdown files.

---

## 🛠️ Technology Stack

*   **Frontend**: React (React 19), Vite, Tailwind CSS v4, Framer Motion, Lucide icons, `@xyflow/react` (React Flow), Recharts, Axios.
*   **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Cookie Parser, CORS, Helmet, Winston, Morgan, Express-rate-limit.
*   **AI**: Google Gemini API.

---

## 📂 Project Structure

```
1st website/
├── backend/
│   ├── config/             # DB, Cloudinary, Gemini, Logger setup
│   ├── controllers/        # Express handlers (Auth, Projects, Papers, AI, Notes)
│   ├── middlewares/        # Authentication, Multer file check, central errors
│   ├── models/             # Mongoose Schemas (User, Paper, Quiz, Flashcard, Notes)
│   ├── prompts/            # Reusable AI templates
│   ├── routes/             # REST Endpoints
│   ├── services/           # Decoupled Business services & AI pipeline
│   └── index.js            # Express Entry
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React state stores (Auth, ResearchProject)
│   │   ├── layouts/        # Layout wrappers (AuthLayout, DashboardLayout)
│   │   ├── pages/          # Pages (Dashboard, Workspace, Notebook, AILab)
│   │   ├── services/       # Axios API client bindings
│   │   ├── App.jsx         # Routing maps
│   │   └── index.css       # Tailwind v4 directives
│   └── vite.config.js      # Vite compilation configurations
├── ARCHITECTURE.md         # Design architecture details
├── DATABASE_SCHEMA.md      # Collections, attributes, and relationships
├── API_DOCUMENTATION.md    # API payload & endpoints documentation
└── PROJECT_PROGRESS.md     # Active development checksheets
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB (v6+) installed and running locally.

### 2. Configure Environment Variables
Create the `.env` configuration files:

#### Backend (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/research_nexus
JWT_SECRET=your_secret_string_minimum_32_characters
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Install & Start Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` inside your browser to start searching and summarizing!
