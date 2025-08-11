@echo off
echo 🔧 Installing Medical Assistant Chatbot Backend Dependencies
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)
echo ✅ Python found
python --version

REM Check if pip is available
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip not found. Please install pip first.
    pause
    exit /b 1
)
echo ✅ pip found
pip --version

echo.
echo 📦 Attempting to install dependencies...

REM Try to install from main requirements.txt first
echo 1️⃣ Trying main requirements.txt...
cd backend
pip install -r requirements.txt
if %errorlevel% equ 0 (
    echo ✅ Main requirements installed successfully!
    echo.
    echo 🎉 Backend dependencies are ready!
    echo You can now start the backend with: uvicorn main:app --reload
    cd ..
    pause
    exit /b 0
)

REM If main requirements fail, try simplified version
echo.
echo ⚠️  Main requirements failed, trying simplified version...
echo 2️⃣ Trying simplified requirements (no Rust compilation needed)...
pip install -r requirements-simple.txt
if %errorlevel% equ 0 (
    echo ✅ Simplified requirements installed successfully!
    echo.
    echo 🎉 Backend dependencies are ready!
    echo You can now start the backend with: uvicorn main:app --reload
    cd ..
    pause
    exit /b 0
)

REM If both fail, provide manual installation steps
echo.
echo ❌ Both installation methods failed.
echo.
echo 🔧 Manual Installation Steps:
echo 1. Install packages one by one:
echo    pip install fastapi==0.95.2
echo    pip install uvicorn[standard]==0.22.0
echo    pip install langchain==0.0.267
echo    pip install langchain-core==0.1.0
echo    pip install langchain-google-genai==0.0.5
echo    pip install pydantic==1.10.8
echo    pip install python-dotenv==1.0.0
echo    pip install requests==2.31.0
echo.
echo 2. Or try upgrading pip first:
echo    python -m pip install --upgrade pip
echo.
echo 3. Check if you have build tools:
echo    pip install wheel setuptools

cd ..
pause




