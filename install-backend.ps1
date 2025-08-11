Write-Host "🔧 Installing Medical Assistant Chatbot Backend Dependencies" -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if pip is available
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip not found. Please install pip first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Attempting to install dependencies..." -ForegroundColor Yellow

# Try to install from main requirements.txt first
Write-Host "1️⃣ Trying main requirements.txt..." -ForegroundColor Cyan
try {
    Set-Location backend
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Main requirements installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Backend dependencies are ready!" -ForegroundColor Green
        Write-Host "You can now start the backend with: uvicorn main:app --reload" -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "⚠️  Main requirements failed, trying simplified version..." -ForegroundColor Yellow
}

# If main requirements fail, try simplified version
Write-Host ""
Write-Host "2️⃣ Trying simplified requirements (no Rust compilation needed)..." -ForegroundColor Cyan
try {
    pip install -r requirements-simple.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Simplified requirements installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Backend dependencies are ready!" -ForegroundColor Green
        Write-Host "You can now start the backend with: uvicorn main:app --reload" -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "❌ Simplified requirements also failed." -ForegroundColor Red
}

# If both fail, provide manual installation steps
Write-Host ""
Write-Host "❌ Both installation methods failed." -ForegroundColor Red
Write-Host ""
Write-Host "🔧 Manual Installation Steps:" -ForegroundColor Yellow
Write-Host "1. Install packages one by one:" -ForegroundColor White
Write-Host "   pip install fastapi==0.95.2" -ForegroundColor Gray
Write-Host "   pip install uvicorn[standard]==0.22.0" -ForegroundColor Gray
Write-Host "   pip install langchain==0.0.267" -ForegroundColor Gray
Write-Host "   pip install langchain-core==0.1.0" -ForegroundColor Gray
Write-Host "   pip install langchain-google-genai==0.0.5" -ForegroundColor Gray
Write-Host "   pip install pydantic==1.10.8" -ForegroundColor Gray
Write-Host "   pip install python-dotenv==1.0.0" -ForegroundColor Gray
Write-Host "   pip install requests==2.31.0" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or try upgrading pip first:" -ForegroundColor White
Write-Host "   python -m pip install --upgrade pip" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check if you have build tools:" -ForegroundColor White
Write-Host "   pip install wheel setuptools" -ForegroundColor Gray

Set-Location ..




