# Environment Setup

## Create .env file in backend directory

Create a file named `.env` in the `backend/` directory with the following content:

```bash
# Google Gemini API Key
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

# Backend Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

## Steps to get your Gemini API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your_actual_api_key_here` in the .env file with your real API key

## Important Notes:

- Never commit your .env file to version control
- Keep your API key secure and private
- The .env file should be in the `backend/` directory, not the root




