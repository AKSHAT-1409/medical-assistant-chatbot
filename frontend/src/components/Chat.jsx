import React, { useState, useEffect, useRef } from 'react'
import api from '../api'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to clean and format AI response
  const formatAIResponse = (text) => {
    let cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    return cleanedText;
  };

  const renderFormattedText = (text) => {
    const formattedText = formatAIResponse(text);
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const SESSION_ID = 'user123'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleAuthError = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.reload()
      return true
    }
    return false
  }

  const loadChatHistory = async () => {
    try {
      const response = await api.get(`/history/${SESSION_ID}`);
      setChatHistory(response.data);
      setMessages(response.data);
      const sessionsResponse = await api.get(`/sessions`);
      const currentSession = sessionsResponse.data.sessions.find(s => s.session_id === SESSION_ID);
      setSessionInfo(currentSession);
    } catch (error) {
      if (!handleAuthError(error)) {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const clearChatHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      try {
        await api.delete(`/sessions/${SESSION_ID}`);
        setMessages([]);
        setChatHistory([]);
        setSessionInfo(null);
      } catch (error) {
        if (!handleAuthError(error)) {
          console.error('Error clearing chat history:', error);
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post(`/send`, {
        message: inputMessage,
        session_id: SESSION_ID
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setChatHistory(response.data.history);
    } catch (error) {
      if (!handleAuthError(error)) {
        console.error('Error sending message:', error);
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">🏥 Medical Assistant Chatbot</h1>
        <p className="text-center text-blue-100 mt-2">
          Get general health information and guidance
        </p>
        {sessionInfo && (
          <div className="mt-3 text-center text-blue-100">
            <span className="text-sm">💬 {sessionInfo.message_count} messages • Session: {SESSION_ID}</span>
            <button onClick={clearChatHistory} className="ml-3 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded">Clear History</button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
        <div className="ml-3 text-sm text-yellow-800">
          <strong>Important:</strong> General health information only. Not a substitute for professional advice.
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Ask about health topics, symptoms, or wellness advice.</p>
            <p className="text-xs mt-2 text-blue-600">Your conversations are saved to your account.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 shadow-md'}`}>
                {message.role === 'assistant' ? (
                  renderFormattedText(message.content)
                ) : (
                  <p>{message.content}</p>
                )}
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about health topics..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          💾 History auto-saved to your account
        </div>
      </div>
    </div>
  )
}

export default Chat