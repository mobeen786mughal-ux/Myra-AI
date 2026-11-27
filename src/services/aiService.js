import axios from 'axios';

export const getAIResponse = async (provider, apiKey, userMessage, chatHistory) => {
  if (!apiKey) {
    return "Please open Settings (Top bar mein gear icon) aur apni API Key daalein.";
  }

  try {
    if (provider === 'groq') {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          // 2026 ka latest fast & smart model (Llama 3.3 70B)
          model: 'llama-3.3-70b-versatile', 
          messages: [
            { role: 'system', content: 'You are MYRA, a smart PC assistant. Reply concisely.' },
            ...chatHistory,
            { role: 'user', content: userMessage }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;

    } else if (provider === 'gemini') {
      // 2026 ka latest fast model (Gemini 3.5 Flash)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            ...chatHistory.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] })),
            { role: 'user', parts: [{ text: userMessage }] }
          ]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data.candidates[0].content.parts[0].text;
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "Error: AI se connect nahi ho paya. API Key ya Model check karein.";
  }
};
