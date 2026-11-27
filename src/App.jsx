import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageSquare, Mic, Monitor, Grid, Settings, FileText, 
  Image, Globe, Crown, Minus, Square, X, ChevronDown, 
  LayoutGrid, Camera, Clipboard, Volume2, VolumeX, Sun, Lock, Power, 
  Activity, Paperclip, Send, RefreshCw, Moon, Trash2, List, 
  Play, Pause, SkipForward, SkipBack, Download, Terminal,
  Calculator, FileCode, MessageCircle, MonitorPlay, HeartPulse, Wifi
} from 'lucide-react';
import { getAIResponse } from './services/aiService';
import Avatar3D from './components/Avatar3D';
import axios from 'axios';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [is3D, setIs3D] = useState(false);
  const [stats, setStats] = useState({ cpu: 0, ram: 0, battery: 100, cpuTemp: 0, diskUsage: 0, uptime: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('aiProvider') || 'groq');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- VOICE TEXT-TO-SPEECH ---
  const speakText = (text) => {
    window.speechSynthesis.cancel(); // Purani awaaz rok do
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; 
    utterance.pitch = 1.1; // Feminine tone
    window.speechSynthesis.speak(utterance);
  };

  // --- VOICE COMMAND ROUTER (A to Z) ---
  const processVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();
    let action = null;

    // System Commands Mapping
    if (lowerText.includes('shutdown') || lowerText.includes('turn off pc')) action = 'shutdown';
    else if (lowerText.includes('restart') || lowerText.includes('reboot')) action = 'restart';
    else if (lowerText.includes('lock') || lowerText.includes('lock pc')) action = 'lock';
    else if (lowerText.includes('sleep')) action = 'sleep';
    else if (lowerText.includes('screenshot') || lowerText.includes('screen shot')) action = 'screenshot';
    else if (lowerText.includes('chrome') || lowerText.includes('browser')) action = 'open_chrome';
    else if (lowerText.includes('notepad')) action = 'open_notepad';
    else if (lowerText.includes('calculator') || lowerText.includes('calc')) action = 'open_calc';
    else if (lowerText.includes('vs code') || lowerText.includes('vscode')) action = 'open_vscode';
    else if (lowerText.includes('volume up')) action = 'volume_up';
    else if (lowerText.includes('volume down')) action = 'volume_down';
    else if (lowerText.includes('mute')) action = 'mute';
    else if (lowerText.includes('play') || lowerText.includes('pause')) action = 'play_pause';
    else if (lowerText.includes('next track') || lowerText.includes('next song')) action = 'next_track';
    else if (lowerText.includes('task manager')) action = 'task_manager';

    if (action) {
      // Agar command match ho gayi, toh execute karo
      handleToolClick(action);
      speakText(`Executing ${action.replace('_', ' ')}`);
      return true; // Command handled
    }
    return false; // AI ko bhejna padega
  };

  // --- SPEECH TO TEXT ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Please use Google Chrome for Voice Mode.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      window.speechSynthesis.cancel(); // Agar MYRA bol rahi hai toh usko rok do
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);

      // Pehle check karo ke yeh system command hai ya AI ko jana chahiye
      const isSystemCommand = processVoiceCommand(transcript);
      
      if (!isSystemCommand) {
        handleSend(transcript); // AI ko bhej do
      }
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
    
    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }]);
    setInput(''); setIsLoading(true);

    const aiResponse = await getAIResponse(aiProvider, apiKey, messageToSend, messages);
    setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
    
    // AI ka jawab bol kar sunao
    speakText(aiResponse);
  };

  const handleToolClick = async (action) => {
    try {
      const res = await axios.post('http://localhost:5000/api/action', { action });
      console.log(`Success: ${res.data.message}`);
    } catch (error) {
      console.error(`Error: Could not execute ${action}. Backend offline?`);
    }
  };

  const askAI = (prompt) => {
    setInput(prompt);
    handleSend(prompt);
    setActiveTab('Home');
  };

  const menuItems = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Apps & Tools', icon: <Grid size={20} /> },
    { name: 'PC Control', icon: <Monitor size={20} /> },
    { name: 'Automation', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#07070a] text-gray-300 font-sans overflow-hidden">
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0a0a0f] border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-800 rounded-lg flex items-center justify-center font-bold text-white">M</div>
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
        <div className="w-[240px] bg-[#0d0d12] border-r border-gray-800/50 p-4 flex flex-col gap-2 z-10">
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-red-900/20 text-white border border-red-900/50' : 'hover:bg-gray-800/50 text-gray-400'}`}>
              <span className={activeTab === item.name ? 'text-red-500' : ''}>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 relative flex flex-col overflow-y-auto">
          
          {activeTab === 'Home' ? (
            <div className="relative w-full h-full flex justify-center items-center">
              <div className="absolute inset-0 z-0 flex justify-center items-center opacity-90">
                 {!is3D ? <img src="/assets/myra.jpg" alt="MYRA" className="h-[90%] object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]" /> : <div className="w-full h-full"><Avatar3D /></div>}
              </div>
            </div>
          ) : (
            /* 50 FEATURES GRID */
            <div className="p-6 z-10 relative">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Grid /> All Tools</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <ToolBtn icon={<Lock/>} label="Lock PC" onClick={() => handleToolClick('lock')} />
                <ToolBtn icon={<Power/>} label="Shutdown" onClick={() => handleToolClick('shutdown')} red />
                <ToolBtn icon={<RefreshCw/>} label="Restart" onClick={() => handleToolClick('restart')} />
                <ToolBtn icon={<Moon/>} label="Sleep" onClick={() => handleToolClick('sleep')} />
                <ToolBtn icon={<Trash2/>} label="Empty Bin" onClick={() => handleToolClick('empty_bin')} />
                <ToolBtn icon={<List/>} label="Task Mgr" onClick={() => handleToolClick('task_manager')} />
                <ToolBtn icon={<Camera/>} label="Screenshot" onClick={() => handleToolClick('screenshot')} />
                <ToolBtn icon={<Volume2/>} label="Vol Up" onClick={() => handleToolClick('volume_up')} />
                <ToolBtn icon={<Volume2/>} label="Vol Down" onClick={() => handleToolClick('volume_down')} />
                <ToolBtn icon={<VolumeX/>} label="Mute" onClick={() => handleToolClick('mute')} />
                <ToolBtn icon={<Globe/>} label="Chrome" onClick={() => handleToolClick('open_chrome')} />
                <ToolBtn icon={<FileCode/>} label="VS Code" onClick={() => handleToolClick('open_vscode')} />
                <ToolBtn icon={<FileText/>} label="Notepad" onClick={() => handleToolClick('open_notepad')} />
                <ToolBtn icon={<Calculator/>} label="Calculator" onClick={() => handleToolClick('open_calc')} />
                <ToolBtn icon={<Terminal/>} label="CMD" onClick={() => handleToolClick('open_cmd')} />
                <ToolBtn icon={<Play/>} label="Play/Pause" onClick={() => handleToolClick('play_pause')} />
                <ToolBtn icon={<SkipForward/>} label="Next Track" onClick={() => handleToolClick('next_track')} />
                <ToolBtn icon={<SkipBack/>} label="Prev Track" onClick={() => handleToolClick('prev_track')} />
                <ToolBtn icon={<Globe/>} label="Weather" onClick={() => askAI("What is the weather in my city right now?")} />
                <ToolBtn icon={<MessageSquare/>} label="Tell Joke" onClick={() => askAI("Tell me a short and funny joke.")} />
                <ToolBtn icon={<Clipboard/>} label="Summarize" onClick={() => askAI("Summarize this: [Paste text here]")} />
                <ToolBtn icon={<HeartPulse/>} label="Motivate Me" onClick={() => askAI("Give me a powerful motivational quote.")} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (Stats) */}
        <div className="w-[300px] bg-[#0d0d12] border-l border-gray-800/50 p-4 flex flex-col gap-4 z-10">
          <div className="bg-[#14141a] border border-gray-800/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Real-time Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div><div className="text-xl font-bold text-blue-500">{stats.cpu}%</div><span className="text-[10px] text-gray-500">CPU Load</span></div>
              <div><div className="text-xl font-bold text-cyan-500">{stats.ram}%</div><span className="text-[10px] text-gray-500">RAM</span></div>
              <div><div className="text-xl font-bold text-red-500">{stats.cpuTemp}°C</div><span className="text-[10px] text-gray-500">Temp</span></div>
              <div><div className="text-xl font-bold text-green-500">{stats.battery}%</div><span className="text-[10px] text-gray-500">Battery</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT BAR */}
      <div className="absolute bottom-6 left-[260px] right-[320px] z-20">
        <div className="bg-[#0d0d12]/90 border border-red-900/30 rounded-full p-2 flex items-center shadow-[0_0_20px_rgba(255,0,0,0.2)]">
          <button onClick={startListening} className={`w-12 h-12 rounded-full flex items-center justify-center ml-2 transition-all ${isListening ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.8)]' : 'bg-red-900/20 text-red-500'}`}>
            <Mic size={20} />
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isListening ? "Listening..." : "Ask me anything or say 'Open Chrome'..."} className="flex-1 bg-transparent outline-none px-6 text-gray-300" />
          <button onClick={() => handleSend()} disabled={isLoading} className="w-12 h-10 rounded-full bg-red-600 flex items-center justify-center text-white mr-2"><Send size={18} /></button>
        </div>
      </div>

      {/* CHAT OVERLAY */}
      {messages.length > 0 && activeTab === 'Home' && (
        <div className="absolute right-[320px] top-16 bottom-24 w-80 bg-[#0d0d12]/95 border border-gray-700/50 rounded-2xl p-4 flex flex-col z-30">
          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-red-900/20 ml-4 border border-red-900/30' : 'bg-gray-800/80 mr-4'}`}>
                <strong className={msg.role === 'user' ? 'text-red-400' : 'text-blue-400'}>{msg.role === 'user' ? 'You: ' : 'MYRA: '}</strong>{msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#111] border border-red-900/50 p-6 rounded-2xl w-80">
            <h2 className="text-xl font-bold mb-4 text-red-500">Settings</h2>
            <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value)} className="w-full bg-[#222] p-2 rounded mb-3 text-white">
              <option value="groq">Groq (Llama 3)</option>
              <option value="gemini">Gemini</option>
            </select>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" className="w-full bg-[#222] p-2 rounded mb-4 text-white" />
            <div className="flex gap-2">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-gray-800 p-2 rounded">Cancel</button>
              <button onClick={saveSettings} className="flex-1 bg-red-600 p-2 rounded text-white font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ icon, label, onClick, red }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 bg-[#14141a] border border-gray-800 rounded-xl hover:bg-[#1a1a24] hover:border-red-500/50 transition-all ${red ? 'text-red-500 border-red-900/50' : 'text-gray-400'}`}>
      <div className="mb-2">{icon}</div>
      <span className="text-[10px] font-medium text-center">{label}</span>
    </button>
  );
}
