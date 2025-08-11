import React, { useState, useEffect } from 'react'
import Chat from './components/Chat.jsx'
import Auth from './components/Auth.jsx'

function App() {
  // --- STATE FROM BOTH COMPONENTS ---
  // From Auth App: Handles authentication status
  const [token, setToken] = useState(localStorage.getItem('token'))
  
  // From MediCore AI App: Handles UI state
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [tagline, setTagline] = useState("")
  const [currentFeature, setCurrentFeature] = useState(0)


  // --- FEATURES FROM MEDI-CORE AI ---
  const features = [
    { icon: "🩺", title: "Symptom Analysis", desc: "AI-powered symptom checker" },
    { icon: "💊", title: "Medication Guide", desc: "Drug information & interactions" },
    { icon: "🧬", title: "Health Insights", desc: "Personalized health recommendations" },
    { icon: "📋", title: "Medical Records", desc: "Organize your health data" }
  ]


  // --- FUNCTIONS FROM AUTH APP ---
  const onAuthenticated = () => {
    setToken(localStorage.getItem('token'))
    setIsLoading(true); // Reset loading screen for new login
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
  }


  // --- USE-EFFECT HOOKS FROM MEDI-CORE AI ---
  // Loading screen timer (now runs after authentication)
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [token])

  // Typing effect for tagline
  useEffect(() => {
    if (!isLoading && token) {
      const fullText = "Advanced AI Healthcare Assistant - Your Health, Our Priority"
      let i = 0
      const typingInterval = setInterval(() => {
        setTagline(fullText.slice(0, i + 1))
        i++
        if (i === fullText.length) clearInterval(typingInterval)
      }, 80)
      return () => clearInterval(typingInterval)
    }
  }, [isLoading, token])

  // Cycle through features
  useEffect(() => {
    if (!isLoading && token) {
      const featureInterval = setInterval(() => {
        setCurrentFeature(prev => (prev + 1) % features.length)
      }, 3000)
      return () => clearInterval(featureInterval)
    }
  }, [isLoading, token, features.length])


  // --- THEME TOGGLE FUNCTION FROM MEDI-CORE AI ---
  const toggleTheme = () => setDarkMode(!darkMode)


  // --- PRIMARY RENDER LOGIC ---

  // 1. If not authenticated, show the Auth component
  if (!token) {
    // Note: You might want to style your Auth component to match the theme
    return <Auth onAuthenticated={onAuthenticated} />
  }

  // 2. If authenticated, but loading, show the loading screen
  if (isLoading) {
    return (
      <div className={`${darkMode ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100"} min-h-screen flex items-center justify-center relative overflow-hidden`}>
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${darkMode ? "bg-blue-400" : "bg-blue-300"} rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-400 border-r-transparent rounded-full animate-spin-reverse"></div>
            <div className="absolute inset-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
          </div>
          <h2 className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-4 animate-pulse`}>
            MediCore AI
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex space-x-1">
              {[0,1,2].map(i => (
                <div key={i} className={`w-3 h-3 ${darkMode ? "bg-blue-400" : "bg-blue-500"} rounded-full animate-bounce`} style={{animationDelay: `${i * 0.2}s`}}></div>
              ))}
            </div>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-lg ml-4`}>
              Loading your healthcare companion...
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className={`h-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. If authenticated and loaded, show the full MediCore AI application
  return (
    <div className={`${darkMode ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"} min-h-screen transition-all duration-700 relative overflow-hidden`}>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${darkMode ? "bg-blue-500/10" : "bg-blue-200/30"} rounded-full animate-float-slow`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 ${darkMode ? "bg-purple-500/10" : "bg-purple-200/30"} rounded-full animate-float-slow-reverse`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${darkMode ? "bg-indigo-500/5" : "bg-indigo-200/20"} rounded-full animate-pulse-slow`}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Header with MERGED navigation and user info */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${darkMode ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"} rounded-xl flex items-center justify-center text-white text-2xl font-bold animate-bounce-gentle`}>
              M
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>MediCore AI</h1>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Healthcare Reimagined</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"} text-sm font-medium animate-pulse`}>
              🟢 AI Online
            </div>
            <span className={`text-sm font-medium hidden sm:block ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {localStorage.getItem('username')}
            </span>
            <button
              onClick={logout}
              className={`px-3 py-2 rounded-xl shadow-md transition-all transform hover:scale-105 hover:shadow-lg ${darkMode ? "bg-red-500/80 text-white" : "bg-red-500 text-white"} font-medium text-sm`}
            >
              Logout
            </button>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl ${darkMode ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900" : "bg-gradient-to-r from-gray-800 to-gray-900 text-white"} font-medium text-sm`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className={`max-w-6xl mx-auto ${darkMode ? "bg-gray-800/50" : "bg-white/40"} backdrop-blur-xl shadow-2xl rounded-3xl p-10 mb-12 border ${darkMode ? "border-gray-700" : "border-white/50"}`}>
          <div className="text-center mb-8">
            <h1 className={`text-6xl font-black mb-6 ${darkMode ? "text-white" : "text-gray-800"} animate-fade-in-up`}>
              🏥 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MediCore AI</span>
            </h1>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed min-h-[3rem] ${darkMode ? "text-gray-300" : "text-gray-600"} animate-fade-in-up`} style={{animationDelay: "0.3s"}}>
              {tagline}<span className="animate-blink">|</span>
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`text-center p-6 rounded-2xl ${darkMode ? "bg-blue-500/20" : "bg-blue-100"} animate-fade-in-up`} style={{animationDelay: "0.5s"}}>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Available</div>
            </div>
            <div className={`text-center p-6 rounded-2xl ${darkMode ? "bg-green-500/20" : "bg-green-100"} animate-fade-in-up`} style={{animationDelay: "0.7s"}}>
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Consultations</div>
            </div>
            <div className={`text-center p-6 rounded-2xl ${darkMode ? "bg-purple-500/20" : "bg-purple-100"} animate-fade-in-up`} style={{animationDelay: "0.9s"}}>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.8%</div>
              <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Accuracy</div>
            </div>
            <div className={`text-center p-6 rounded-2xl ${darkMode ? "bg-orange-500/20" : "bg-orange-100"} animate-fade-in-up`} style={{animationDelay: "1.1s"}}>
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>User Rating</div>
            </div>
          </div>

          {/* Features showcase */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} 
                className={`p-6 rounded-xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
                  currentFeature === index 
                    ? (darkMode ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400" : "bg-gradient-to-r from-blue-200 to-purple-200 border-blue-500") 
                    : (darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-white/50 hover:bg-white/80")
                } border-2 ${currentFeature === index ? "" : "border-transparent hover:border-blue-300"}`}>
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className={`font-bold text-lg mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className={`p-6 rounded-2xl border-l-4 ${darkMode ? "bg-amber-900/30 border-amber-500 text-amber-200" : "bg-amber-50 border-amber-500 text-amber-800"} animate-fade-in-up`} style={{animationDelay: "1.3s"}}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Important Medical Disclaimer</h4>
                <p className="leading-relaxed">
                  MediCore AI provides general health information and should not replace professional medical advice, diagnosis, or treatment. 
                  Always consult qualified healthcare professionals for serious health concerns or before making medical decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section with enhanced design */}
        <div className={`max-w-5xl mx-auto rounded-3xl shadow-2xl border ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/50 border-white/50"} backdrop-blur-xl animate-fade-in-up overflow-hidden`} style={{animationDelay: "1.5s"}}>
          <div className={`px-8 py-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full ${darkMode ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"} flex items-center justify-center text-white animate-pulse`}>
                  🤖
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>AI Health Assistant</h3>
                  <p className={`text-sm ${darkMode ? "text-green-400" : "text-green-600"}`}>● Online and ready to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                  GPT-4 Powered
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}>
                  HIPAA Compliant
                </div>
              </div>
            </div>
          </div>
          
          <div className={darkMode ? "dark" : ""}>
            <Chat />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className={`max-w-4xl mx-auto p-8 rounded-2xl ${darkMode ? "bg-gray-800/40" : "bg-white/30"} backdrop-blur-lg`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div>
                <h4 className={`font-bold text-lg mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Quick Access</h4>
                <div className="space-y-2">
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Emergency Contacts</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Find Doctors</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Health Records</p>
                </div>
              </div>
              <div>
                <h4 className={`font-bold text-lg mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Resources</h4>
                <div className="space-y-2">
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Health Articles</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Drug Database</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Wellness Tips</p>
                </div>
              </div>
              <div>
                <h4 className={`font-bold text-lg mb-3 ${darkMode ? "text-white" : "text-gray-800"}`}>Support</h4>
                <div className="space-y-2">
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Help Center</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Contact Us</p>
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-500 cursor-pointer transition-colors`}>Privacy Policy</p>
                </div>
              </div>
            </div>
            <div className={`pt-6 border-t ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-600"} text-sm`}>
              <p>© 2025 MediCore AI. Advanced healthcare technology for everyone.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, -10px) rotate(5deg); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, 10px) rotate(-5deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 10s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 1s linear infinite; }
        .animate-loading-bar { animation: loading-bar 2s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-blink { animation: blink 1s infinite; }
      `}</style>
    </div>
  )
}

export default App