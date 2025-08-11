# Medical Assistant Chatbot MVP

A medical assistant chatbot built with FastAPI backend, React frontend, and Google Gemini AI integration via LangChain.

## Project Structure
```
medical-assistant-chatbot/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── requirements-simple.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chat.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── .env.example
├── install-backend.ps1
├── install-backend.bat
├── test-backend.py
└── README.md
```

## Features
- **Backend**: FastAPI with LangChain integration
- **LLM**: Google Gemini AI via LangChain
- **Frontend**: React with Vite and Tailwind CSS
- **Chat History**: In-memory storage (ready for database integration)
- **API Endpoints**:
  - `POST /send` - Send message and get response
  - `GET /history/{session_id}` - Fetch chat history

## Quick Start

### Option 1: Automated Installation (Recommended)
```bash
# Windows (PowerShell)
.\install-backend.ps1

# Windows (Command Prompt)
install-backend.bat
```

### Option 2: Manual Setup

#### 1. Clone and Setup Project
```bash
# Create project directory
mkdir medical-assistant-chatbot
cd medical-assistant-chatbot

# Create backend and frontend folders
mkdir backend frontend
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Try main requirements first
pip install -r requirements.txt

# If that fails, use simplified requirements (no Rust needed)
pip install -r requirements-simple.txt
```

#### 3. Frontend Setup
```bash
cd ../frontend

# Create Vite React project
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install axios

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 4. Environment Configuration
1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `.env.example` to `backend/.env`
3. Add your API key: `GEMINI_API_KEY=your_api_key_here`

## Troubleshooting

### Backend Installation Issues

#### Problem: Rust Compilation Required
If you see errors about Rust or Cargo being needed:

**Solution 1: Use Simplified Requirements**
```bash
cd backend
pip install -r requirements-simple.txt
```

**Solution 2: Install Packages Individually**
```bash
pip install fastapi==0.95.2
pip install uvicorn[standard]==0.22.0
pip install langchain==0.0.267
pip install langchain-core==0.1.0
pip install langchain-google-genai==0.0.5
pip install pydantic==1.10.8
pip install python-dotenv==1.0.0
pip install requests==2.31.0
```

**Solution 3: Upgrade Build Tools**
```bash
python -m pip install --upgrade pip
pip install wheel setuptools
```

#### Problem: ModuleNotFoundError
If you see "No module named 'fastapi'":

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements-simple.txt
```

### Frontend Installation Issues

#### Problem: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Running the Application

### Backend
```bash
cd backend
# Activate virtual environment if not already active
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing

### Test Backend API
```bash
# Make sure backend is running first
python test-backend.py
```

### Test Frontend
1. Open http://localhost:5173 in your browser
2. Check browser console for any errors
3. Try sending a test message

## API Endpoints

### POST /send
Send a message and receive a response with updated chat history.

**Request Body:**
```json
{
  "message": "What are the symptoms of diabetes?",
  "session_id": "user123"
}
```

**Response:**
```json
{
  "response": "Diabetes symptoms include...",
  "history": [
    {
      "role": "user",
      "content": "What are the symptoms of diabetes?",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Diabetes symptoms include...",
      "timestamp": "2024-01-01T12:00:01Z"
    }
  ]
}
```

### GET /history/{session_id}
Fetch chat history for a specific session.

**Response:**
```json
[
  {
    "role": "user",
    "content": "What are the symptoms of diabetes?",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  {
    "role": "assistant",
    "content": "Diabetes symptoms include...",
    "timestamp": "2024-01-01T12:00:01Z"
  }
]
```

## Development Notes

- **Session ID**: Currently hardcoded as "user123" in the frontend for MVP
- **Chat History**: Stored in memory (will be replaced with database in future versions)
- **LangGraph Ready**: Backend structure prepared for easy LangGraph integration
- **Error Handling**: Basic error handling implemented
- **Responsive Design**: Mobile-friendly chat interface

## Future Enhancements

- Database integration for persistent chat history
- User authentication and session management
- LangGraph flow orchestration
- Medical knowledge base integration
- Conversation context management
- Multi-language support

## Common Issues and Solutions

### 1. Backend Won't Start
- Check if port 8000 is available
- Ensure virtual environment is activated
- Verify all dependencies are installed

### 2. Frontend Can't Connect to Backend
- Ensure backend is running on http://localhost:8000
- Check CORS settings in backend
- Verify API_BASE_URL in Chat.jsx

### 3. AI Responses Not Working
- Check GEMINI_API_KEY in backend/.env
- Verify API key is valid and has credits
- Check backend logs for error messages

### 4. Build Errors
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check Node.js version (16+ recommended)

## Dependencies Versions

- Python: 3.8+
- Node.js: 16+
- FastAPI: Latest (or 0.95.2 for compatibility)
- React: 18+
- Vite: Latest
- Tailwind CSS: Latest
