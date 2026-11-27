import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageSquare, Mic, Monitor, Grid, Settings, FileText, 
  Image, Globe, Crown, Minus, Square, X, ChevronDown, 
  LayoutGrid, Camera, Clipboard, Volume2, Sun, Lock, Power, 
  Activity, Paperclip, Send
} from 'lucide-react';
import { getAIResponse } from './services/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  
  // Settings & API States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('aiProvider') || 'groq');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');

  // Chat States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('apiKey', apiKey);
    setIsSettingsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getAIResponse(aiProvider, apiKey, input, messages);
    setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
  };

  const menuItems = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Chat', icon: <MessageSquare size={20} /> },
    { name: 'Voice Mode', icon: <Mic size={20} /> },
    { name: 'PC Control', icon: <Monitor size={20} /> },
    { name: 'Apps & Tools', icon: <Grid size={20} /> },
    { name: 'Automation', icon: <Activity size={20} /> },
    { name: 'Files & Documents', icon: <FileText size={20} /> },
    { name: 'Media', icon: <Image size={20} /> },
    { name: 'Web & Search', icon: <Globe size={20} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#07070a] text-gray-300 font-sans overflow-hidden">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0a0a0f] border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-800 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]">A</div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">MYRA <span className="text-red-500">AI</span></h1>
          </div>
        </div>
        <div className="flex gap-2 text-gray-400">
          <button onClick={() => setIsSettingsOpen(true)} className="hover:bg-gray-800 p-2 rounded-md"><Settings size={16} /></button>
          <button className="hover:bg-gray-800 p-2 rounded-md"><Minus size={16} /></button>
          <button className="hover:bg-gray-800 p-2 rounded-md"><Square size={14} /></button>
          <button className="hover:bg-red-600 hover:text-white p-2 rounded-md transition-colors"><X size={16} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-[260px] bg-[#0d0d12] border-r border-gray-800/50 p-4 flex flex-col gap-2 z-10">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.name 
                  ? 'bg-red-900/20 text-white border border-red-900/50' 
                  : 'hover:bg-gray-800/50 text-gray-400'
              }`}
            >
              <span className={activeTab === item.name ? 'text-red-500' : ''}>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
          <div className="mt-auto p-4 bg-[#14141a] border border-gray-800 rounded-xl relative overflow-hidden">
             <div className="flex items-center gap-2 mb-1">
               <Crown size={16} className="text-red-500" />
               <h3 className="text-sm font-bold text-white">MYRA Premium</h3>
             </div>
             <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</p>
          </div>
        </div>

        {/* MAIN CONTENT (Avatar Area) */}
        <div className="flex-1 relative flex flex-col">
          <div className="absolute inset-0 z-0 flex justify-center items-center opacity-90">
             {/* Yahan aapki image load hogi (Naam myra.jpg kar diya gaya hai) */}
             <img src="/assets/myra.jpg" alt="MYRA" className="h-[90%] object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.3)]" />
          </div>

          <div className="relative z-10 p-8">
            <h2 className="text-4xl font-bold text-white mb-2">Hello, I'm</h2>
            <h1 className="text-5xl font-black text-red-500 mb-2 tracking-tight">MYRA AI</h1>
            <p className="text-gray-400">Your Smart PC Assistant</p>
          </div>

          {/* Chat Overlay Panel (Shows when messages exist) */}
          {messages.length > 0 && (
            <div className="absolute right-8 top-32 bottom-28 w-80 bg-[#0d0d12]/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 flex flex-col z-20 shadow-2xl">
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-red-900/20 ml-4 border border-red-900/30' : 'bg-gray-800/80 mr-4'}`}>
                    <strong className={msg.role === 'user' ? 'text-red-400' : 'text-blue-400'}>
                      {msg.role === 'user' ? 'You: ' : 'MYRA: '}
                    </strong>
                    {msg.content}
                  </div>
                ))}
                {isLoading && <p className="text-red-500 text-sm animate-pulse">MYRA is thinking...</p>}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          <div className="relative z-10 flex gap-4 mt-auto mb-24 ml-8">
             <button className="bg-[#0a0a0f]/80 border border-gray-700/50 px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:border-red-500 transition">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Wake Word
             </button>
             <button className="bg-[#0a0a0f]/80 border border-gray-700/50 px-4 py-2 rounded-full text-xs flex items-center gap-2 hover:border-red-500 transition">
                <Mic size={14} /> Tap to Talk
             </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[340px] bg-[#0d0d12] border-l border-gray-800/50 p-4 flex flex-col gap-4 z-10">
          <div className="bg-[#14141a] border border-gray-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 bg-green-900/20 text-green-400 px-3 py-1 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
            <div className="flex justify-between text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center text-sm font-bold">4%</div>
                <span className="text-[10px] text-gray-500">CPU</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 flex items-center justify-center text-sm font-bold">10%</div>
                <span className="text-[10px] text-gray-500">RAM</span>
              </div>
            </div>
          </div>

          <div className="bg-[#14141a] border border-gray-800/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity size={16} className="text-red-500"/> Quick Tools</h3>
            <div className="grid grid-cols-4 gap-2">
              {[ {i: <LayoutGrid size={18}/>, t: 'Open App'}, {i: <Camera size={18}/>, t: 'Screenshot'}, {i: <Power size={18}/>, t: 'Shutdown'} ].map((tool, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-2 bg-[#0a0a0f] border border-gray-800 rounded-xl hover:border-red-500/50 transition">
                  <div className="text-gray-400 mb-1">{tool.i}</div>
                  <span className="text-[9px] text-gray-500 text-center">{tool.t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT BAR */}
      <div className="absolute bottom-6 left-[280px] right-[360px] z-20">
        <div className="bg-[#0d0d12]/90 border border-red-900/30 rounded-full p-2 flex items-center shadow-[0_0_30px_rgba(255,0,0,0.15)]">
          <button className="w-12 h-12 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center ml-2"><Mic size={20} /></button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..." 
            className="flex-1 bg-transparent outline-none px-6 text-gray-300" 
          />
          <button onClick={handleSend} disabled={isLoading} className="w-12 h-10 rounded-full bg-red-600 flex items-center justify-center text-white mr-2 disabled:opacity-50"><Send size={18} /></button>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#111] border border-red-900/50 p-8 rounded-2xl w-96 shadow-[0_0_50px_rgba(255,0,0,0.2)]">
            <h2 className="text-2xl font-bold mb-6 text-red-500">AI Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Select AI Provider</label>
              <select 
                value={aiProvider} 
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 text-white p-3 rounded-lg outline-none"
              >
                <option value="groq">Groq (Llama 3 - Fast)</option>
                <option value="gemini">Google Gemini (Pro)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API Key here"
                className="w-full bg-[#222] border border-gray-700 text-white p-3 rounded-lg outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-gray-800 p-3 rounded-lg hover:bg-gray-700">Cancel</button>
              <button onClick={saveSettings} className="flex-1 bg-red-600 p-3 rounded-lg hover:bg-red-700 font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
