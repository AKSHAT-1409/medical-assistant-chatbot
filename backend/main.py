from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Medical Assistant Chatbot API",
    description="API for medical assistant chatbot using Google Gemini AI",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chat history storage file
CHAT_HISTORY_FILE = "chat_history.json"

def load_chat_history():
    """Load chat history from JSON file"""
    try:
        if os.path.exists(CHAT_HISTORY_FILE):
            with open(CHAT_HISTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading chat history: {e}")
        return {}

def save_chat_history(chat_history):
    """Save chat history to JSON file"""
    try:
        with open(CHAT_HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(chat_history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving chat history: {e}")

# Load existing chat history on startup
chat_history = load_chat_history()
print(f"📚 Loaded {len(chat_history)} chat sessions from storage")

# Initialize the Gemini model with fallback options
def initialize_gemini_model():
    """Initialize Gemini model with fallback options"""
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ]

    for model_name in models_to_try:
        try:
            model = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=0.7,
                convert_system_message_to_human=True
            )
            print(f"✅ Successfully initialized Gemini model: {model_name}")
            return model, True
        except Exception as e:
            print(f"⚠️  Failed to initialize {model_name}: {e}")
            continue

    print("❌ All Gemini models failed to initialize")
    return None, False

try:
    model, ai_service_available = initialize_gemini_model()
except Exception as e:
    print(f"Error during model initialization: {e}")
    model = None
    ai_service_available = False

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    history: List[dict]

class ChatHistoryItem(BaseModel):
    role: str
    content: str
    timestamp: str

# Medical context prompt template
MEDICAL_PROMPT_TEMPLATE = """
You are a helpful medical assistant chatbot. Your role is to provide general health information and guidance.

IMPORTANT DISCLAIMERS:
- You are NOT a doctor and cannot provide medical diagnosis
- Always recommend consulting healthcare professionals for serious concerns
- Provide general information only, not specific medical advice
- If someone has urgent symptoms, direct them to seek immediate medical attention

RESPONSE FORMAT:
- Use clear, simple language
- Emphasize important safety information
- Do NOT use markdown formatting like ** or *
- Use plain text with clear structure
- Highlight critical warnings and safety notes

User Question: {user_message}

Please provide a helpful, informative response while keeping the above disclaimers in mind. Focus on general information and safety.
"""

medical_prompt = ChatPromptTemplate.from_template(MEDICAL_PROMPT_TEMPLATE)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Medical Assistant Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "POST /send": "Send a message and get response",
            "GET /history/{session_id}": "Get chat history for a session"
        }
    }

@app.post("/send", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """Send a message and receive a response with updated chat history"""

    if not model:
        raise HTTPException(status_code=500, detail="AI service not available")

    try:
        # Get existing history for the session
        session_id = chat_message.session_id
        if session_id not in chat_history:
            chat_history[session_id] = []

        # Add user message to history
        user_message = {
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        chat_history[session_id].append(user_message)

        # Prepare context from previous messages (last 5 for context)
        context_messages = chat_history[session_id][-5:] if len(chat_history[session_id]) > 1 else []

        # Create conversation context for the AI
        conversation_context = []
        for msg in context_messages:
            if msg["role"] == "user":
                conversation_context.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                conversation_context.append(AIMessage(content=msg["content"]))

        # Generate AI response
        response = await model.ainvoke(conversation_context + [
            HumanMessage(content=medical_prompt.format(user_message=chat_message.message))
        ])

        # Add AI response to history
        ai_message = {
            "role": "assistant",
            "content": response.content,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        chat_history[session_id].append(ai_message)

        # Save updated chat history to disk
        save_chat_history(chat_history)
        print(f"💾 Saved chat history for session {session_id} ({len(chat_history[session_id])} messages)")

        return ChatResponse(
            response=response.content,
            history=chat_history[session_id]
        )

    except Exception as e:
        # Remove the user message if AI response failed
        if session_id in chat_history and chat_history[session_id]:
            chat_history[session_id].pop()

        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/history/{session_id}", response_model=List[ChatHistoryItem])
async def get_chat_history(session_id: str):
    """Get chat history for a specific session"""
    if session_id not in chat_history:
        return []

    return [ChatHistoryItem(**msg) for msg in chat_history[session_id]]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_service": "available" if model else "unavailable",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/sessions")
async def list_sessions():
    """List all chat sessions"""
    sessions = []
    for session_id, messages in chat_history.items():
        sessions.append({
            "session_id": session_id,
            "message_count": len(messages),
            "last_message": messages[-1]["timestamp"] if messages else None,
            "last_message_content": messages[-1]["content"][:100] + "..." if messages else None
        })
    
    return {
        "total_sessions": len(sessions),
        "sessions": sessions
    }

@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear chat history for a specific session"""
    if session_id in chat_history:
        del chat_history[session_id]
        save_chat_history(chat_history)
        return {"message": f"Session {session_id} cleared successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.delete("/sessions")
async def clear_all_sessions():
    """Clear all chat history"""
    global chat_history
    chat_history = {}
    save_chat_history(chat_history)
    return {"message": "All sessions cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
