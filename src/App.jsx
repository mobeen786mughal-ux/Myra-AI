import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageSquare, Mic, Monitor, Grid, Settings, FileText, 
  Image, Globe, Crown, Minus, Square, X, ChevronDown, 
  LayoutGrid, Camera, Clipboard, Volume2, Sun, Lock, Power, 
  Activity, Paperclip, Send
} from 'lucide-react';
import { getAIResponse } from './services/aiService';
import Avatar3D from './components/Avatar3D';
import axios from 'axios';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [is3D, setIs3D] = useState(false);
  const [stats, setStats] = useState({ cpu: 0, ram: 0, battery: 100 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('aiProvider') || 'groq');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // Voice State
  const chatEndRef = useRef(null);

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stats');
        setStats(res.data);
      } catch (error) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- VOICE FEATURES ---
  // 1. Text to Speech (AI ki awaaz)
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1; // Thodi feminine awaaz
    window.speechSynthesis.speak(utterance);
  };

  // 2. Speech to Text (Aapki awaaz sunna)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapka browser voice support nahi karta. Chrome use karein.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Ya 'ur-PK' for Urdu
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript); // Awaaz aane par seedha send karega
    };

    recognition.start();
  };

  const saveSettings = () => {
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('apiKey', apiKey);
    setIsSettingsOpen(false);
  };

  const handleSend = async (voiceInput = null) => {
    const messageToSend = voiceInput || input;
    if (!messageToSend.trim()) return;
    
    const userMsg = { role: 'user', content: messageToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getAIResponse(aiProvider, apiKey, messageToSend, messages);
    
    setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
    
    // AI ka jawab bol kar sunao
    speakText(aiResponse);
  };

  const handleToolClick = async (action) => {
    try {
      await axios.post('http://localhost:5000/api/action', { action });
      alert(`${action} command sent!`);
    } catch (error) {
      alert('Backend not running!');
    }
  };

  const menuItems = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Chat', icon: <MessageSquare size={20} /> },
    { name: 'PC Control', icon: <Monitor size={20} /> },
    { name: 'Apps & Tools', icon: <Grid size={20} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#07070a] text-gray-300 font-sans overflow-hidden">
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0a0a0f] border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-800 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <h1 className="text-xl font-bold tracking-wider text-white">MYRA <span className="text-red-500">AI</span></h1>
        </div>
        <div className="flex gap-2 text-gray-400">
          <button onClick={() => setIs3D(!is3D)} className="hover:bg-gray-800 px-3 py-1 rounded-md text-xs border border-gray-600">Switch {is3D ? '2D' : '3D'}</button>
          <button onClick={() => setIsSettingsOpen(true)} className="hover:bg-gray-800 p-2 rounded-md"><Settings size={16} /></button>
          <button className="hover:bg-red-600 hover:text-white p-2 rounded-md"><X size={16} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-[260px] bg-[#0d0d12] border-r border-gray-800/50 p-4 flex flex-col gap-2 z-10">
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-red-900/20 text-white border border-red-900/50' : 'hover:bg-gray-800/50 text-gray-400'}`}>
              <span className={activeTab === item.name ? 'text-red-500' : ''}>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>

        {/* MAIN AVATAR AREA */}
        <div className="flex-1 relative flex flex-col">
          <div className="absolute inset-0 z-0 flex justify-center items-center opacity-90">
             {!is3D ? (
               <img src="/assets/myra.jpg" alt="MYRA" className="h-[90%] object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]" />
             ) : (
               <div className="w-full h-full"><Avatar3D /></div>
             )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[340px] bg-[#0d0d12] border-l border-gray-800/50 p-4 flex flex-col gap-4 z-10">
          <div className="bg-[#14141a] border border-gray-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs bg-green-900/20 text-green-400 px-3 py-1 rounded-full">Online</span>
            </div>
            <div className="flex justify-between text-center">
              <div><div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center text-xs font-bold">{stats.cpu}%</div><span className="text-[10px] text-gray-500">CPU</span></div>
              <div><div className="w-12 h-12 rounded-full border-4 border-cyan-500 flex items-center justify-center text-xs font-bold">{stats.ram}%</div><span className="text-[10px] text-gray-500">RAM</span></div>
              <div><div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-xs font-bold">{stats.battery}%</div><span className="text-[10px] text-gray-500">Batt</span></div>
            </div>
          </div>

          <div className="bg-[#14141a] border border-gray-800/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Quick Tools</h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleToolClick('lock')} className="flex flex-col items-center p-2 bg-[#0a0a0f] rounded-xl hover:border-red-500 border border-gray-800"><Lock size={16} className="mb-1"/> <span className="text-[9px]">Lock</span></button>
              <button onClick={() => handleToolClick('shutdown')} className="flex flex-col items-center p-2 bg-[#0a0a0f] rounded-xl hover:border-red-500 border border-gray-800"><Power size={16} className="text-red-500 mb-1"/> <span className="text-[9px]">Shut</span></button>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT BAR */}
      <div className="absolute bottom-6 left-[280px] right-[360px] z-20">
        <div className="bg-[#0d0d12]/90 border border-red-900/30 rounded-full p-2 flex items-center">
          <button onClick={startListening} className={`w-12 h-12 rounded-full flex items-center justify-center ml-2 transition ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-red-900/20 text-red-500'}`}>
            <Mic size={20} />
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." className="flex-1 bg-transparent outline-none px-6 text-gray-300" />
          <button onClick={() => handleSend()} disabled={isLoading} className="w-12 h-10 rounded-full bg-red-600 flex items-center justify-center text-white mr-2"><Send size={18} /></button>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#111] border border-red-900/50 p-6 rounded-2xl w-80">
            <h2 className="text-xl font-bold mb-4 text-red-500">Settings</h2>
            <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)} className="w-full bg-[#222] p-2 rounded mb-3 text-white">
              <option value="groq">Groq (Llama 3.3)</option>
              <option value="gemini">Gemini</option>
            </select>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" className="w-full bg-[#222] p-2 rounded mb-4 text-white" />
            <div className="flex gap-2">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-gray-800 p-2 rounded">Cancel</button>
              <button onClick={saveSettings} className="flex-1 bg-red-600 p-2 rounded text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
