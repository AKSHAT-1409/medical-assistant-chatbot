from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import ChatPromptTemplate
import jwt
import hashlib

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Medical Assistant Chatbot API",
    description="API for medical assistant chatbot using Google Gemini AI",
    version="1.1.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Persistent storage files
# -------------------------
CHAT_HISTORY_FILE = "chat_history.json"
USERS_FILE = "users.json"

# -------------------------
# Auth / JWT utilities
# -------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))  # 12 hours default
PASSWORD_SALT = os.getenv("PASSWORD_SALT", "dev_salt_change_me")

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# -------------------------
# Helpers: storage
# -------------------------

def load_json_file(path: str, default: Any) -> Any:
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return default
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return default

def save_json_file(path: str, data: Any) -> None:
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving {path}: {e}")

# Users storage
users: Dict[str, Dict[str, Any]] = load_json_file(USERS_FILE, {})

# Chat history storage shape (per-user): { username: { session_id: [messages...] } }
chat_history: Dict[str, Dict[str, List[dict]]] = load_json_file(CHAT_HISTORY_FILE, {})
print(f"📚 Loaded users: {len(users)} | chat sessions across users: {sum(len(v) for v in chat_history.values()) if isinstance(chat_history, dict) else 0}")

# If chat_history is legacy flat (session_id -> messages list), wrap under a legacy user
if isinstance(chat_history, dict) and chat_history and all(isinstance(v, list) for v in chat_history.values()):
    chat_history = {"__legacy__": chat_history}

# -------------------------
# Helpers: auth
# -------------------------

def hash_password(password: str) -> str:
    return hashlib.sha256(f"{PASSWORD_SALT}:{password}".encode("utf-8")).hexdigest()

def verify_password(plain: str, password_hash: str) -> bool:
    return hash_password(plain) == password_hash

def create_access_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_username(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    if username not in users:
        raise HTTPException(status_code=401, detail="User not found")
    return username

# -------------------------
# Chat helpers (per-user)
# -------------------------

def get_user_sessions(username: str) -> Dict[str, List[dict]]:
    return chat_history.setdefault(username, {})

def get_session_messages(username: str, session_id: str) -> List[dict]:
    sessions = get_user_sessions(username)
    return sessions.setdefault(session_id, [])

def save_chat() -> None:
    save_json_file(CHAT_HISTORY_FILE, chat_history)

# -------------------------
# Gemini model init (with fallbacks)
# -------------------------

def initialize_gemini_model():
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro",
    ]
    for model_name in models_to_try:
        try:
            model = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=0.7,
                convert_system_message_to_human=True,
            )
            print(f"✅ Successfully initialized Gemini model: {model_name}")
            return model
        except Exception as e:
            print(f"⚠️  Failed to initialize {model_name}: {e}")
    print("❌ All Gemini models failed to initialize")
    return None

model = initialize_gemini_model()

# -------------------------
# Pydantic models for chat
# -------------------------
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

# -------------------------
# Public endpoints
# -------------------------
@app.get("/")
async def root():
    return {
        "message": "Medical Assistant Chatbot API",
        "version": "1.1.0",
        "endpoints": {
            "POST /auth/register": "Create a new user",
            "POST /auth/login": "Login and get JWT token",
            "POST /send": "Send a message and get response (auth)",
            "GET /history/{session_id}": "Get chat history for a session (auth)",
            "GET /sessions": "List sessions (auth)",
        },
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_service": "available" if model else "unavailable",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

# -------------------------
# Auth endpoints
# -------------------------
@app.post("/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    username = user.username.strip().lower()
    if not username or not user.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    if username in users:
        raise HTTPException(status_code=400, detail="Username already exists")
    users[username] = {
        "username": username,
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    save_json_file(USERS_FILE, users)
    token = create_access_token(username)
    return TokenResponse(access_token=token)

@app.post("/auth/login", response_model=TokenResponse)
async def login(user: UserLogin):
    username = user.username.strip().lower()
    record = users.get(username)
    if not record or not verify_password(user.password, record["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(username)
    return TokenResponse(access_token=token)

# -------------------------
# Chat endpoints (authenticated)
# -------------------------
@app.post("/send", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage, current_user: str = Depends(get_current_username)):
    if not model:
        raise HTTPException(status_code=500, detail="AI service not available")

    try:
        # Per-user session messages
        messages = get_session_messages(current_user, chat_message.session_id)

        # Add user message
        user_message = {
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        messages.append(user_message)

        # Prepare context (last 5 pairs)
        context_messages = messages[-5:] if len(messages) > 1 else []
        conversation_context = []
        for msg in context_messages:
            if msg["role"] == "user":
                conversation_context.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                conversation_context.append(AIMessage(content=msg["content"]))

        # Generate AI response
        response = await model.ainvoke(
            conversation_context
            + [HumanMessage(content=medical_prompt.format(user_message=chat_message.message))]
        )

        ai_message = {
            "role": "assistant",
            "content": response.content,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        messages.append(ai_message)

        save_chat()
        return ChatResponse(response=response.content, history=messages)

    except Exception as e:
        # Rollback last user message on failure
        sessions = get_user_sessions(current_user)
        if chat_message.session_id in sessions and sessions[chat_message.session_id]:
            sessions[chat_message.session_id].pop()
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.get("/history/{session_id}", response_model=List[ChatHistoryItem])
async def get_chat_history(session_id: str, current_user: str = Depends(get_current_username)):
    sessions = get_user_sessions(current_user)
    return [ChatHistoryItem(**msg) for msg in sessions.get(session_id, [])]

@app.get("/sessions")
async def list_sessions(current_user: str = Depends(get_current_username)):
    sessions = get_user_sessions(current_user)
    out = []
    for session_id, messages in sessions.items():
        out.append({
            "session_id": session_id,
            "message_count": len(messages),
            "last_message": messages[-1]["timestamp"] if messages else None,
            "last_message_content": messages[-1]["content"][:100] + "..." if messages else None,
        })
    return {"total_sessions": len(out), "sessions": out}

@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str, current_user: str = Depends(get_current_username)):
    sessions = get_user_sessions(current_user)
    if session_id in sessions:
        del sessions[session_id]
        save_chat()
        return {"message": f"Session {session_id} cleared successfully"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.delete("/sessions")
async def clear_all_sessions(current_user: str = Depends(get_current_username)):
    chat_history[current_user] = {}
    save_chat()
    return {"message": "All sessions cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
