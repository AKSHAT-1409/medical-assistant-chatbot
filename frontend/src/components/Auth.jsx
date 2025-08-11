import React, { useState } from 'react'
import api from '../api'

// A simple SVG spinner component to use inside the button
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Auth = ({ onAuthenticated }) => {
  // --- All functionality and state remains unchanged ---
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await api.post(endpoint, { username, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('username', username)
      onAuthenticated()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/30 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white">
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </span>
            </h2>
            <p className="text-slate-400 mt-2">{mode === 'login' ? 'Sign in to access your dashboard' : 'Get started with us today'}</p>
          </div>

          {error && (
            <div className="mb-4 text-sm bg-red-900/50 text-red-300 border border-red-500/30 px-4 py-3 rounded-lg animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Username Input with Icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                placeholder="Username"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            {/* Password Input with Icon */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner /> : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-slate-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button 
              className="font-medium text-cyan-400 hover:underline ml-1" 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('') // Clear error on mode switch
              }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Add this style block for animations, e.g., in your global CSS or here with a library like styled-jsx */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
            animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  )
}

export default Auth