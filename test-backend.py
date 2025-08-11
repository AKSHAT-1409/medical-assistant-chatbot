#!/usr/bin/env python3
"""
Simple test script to verify the Medical Assistant Chatbot backend is working.
Run this after starting the backend server.
"""

import requests
import json
import time

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🏥 Testing Medical Assistant Chatbot Backend")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json()['status']}")
            print(f"   AI Service: {response.json()['ai_service']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is the server running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Root endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"   Message: {response.json()['message']}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test 3: Chat history (should be empty initially)
    print("\n3. Testing chat history endpoint...")
    try:
        response = requests.get(f"{base_url}/history/user123")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Chat history retrieved: {len(history)} messages")
            if len(history) == 0:
                print("   (Empty history - this is expected for new sessions)")
        else:
            print(f"❌ Chat history failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Chat history error: {e}")
    
    # Test 4: Send message (requires GEMINI_API_KEY)
    print("\n4. Testing message sending...")
    try:
        test_message = {
            "message": "Hello, can you tell me about healthy eating?",
            "session_id": "user123"
        }
        response = requests.post(f"{base_url}/send", json=test_message)
        if response.status_code == 200:
            print("✅ Message sent successfully!")
            data = response.json()
            print(f"   Response: {data['response'][:100]}...")
            print(f"   History length: {len(data['history'])}")
        elif response.status_code == 500:
            error_detail = response.json().get('detail', 'Unknown error')
            if "GEMINI_API_KEY" in error_detail or "AI service not available" in error_detail:
                print("⚠️  Message test failed - GEMINI_API_KEY not configured")
                print("   This is expected if you haven't set up your API key yet")
            else:
                print(f"❌ Message test failed: {error_detail}")
        else:
            print(f"❌ Message test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Message test error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Backend testing completed!")
    
    # Final status
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            ai_status = response.json()['ai_service']
            if ai_status == 'available':
                print("🎉 Backend is fully operational with AI service!")
            else:
                print("⚠️  Backend is running but AI service is unavailable")
                print("   Please check your GEMINI_API_KEY configuration")
        else:
            print("❌ Backend health check failed")
    except:
        print("❌ Cannot verify final status")
    
    return True

if __name__ == "__main__":
    print("Make sure the backend server is running on http://localhost:8000")
    print("You can start it with: cd backend && uvicorn main:app --reload")
    print()
    
    try:
        test_backend()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nUnexpected error during testing: {e}")




