const SYSTEM_PROMPT = `You are Circle AI, a helpful and professional AI assistant for a social networking platform called "Make My Circle".

Your capabilities include:
- Answering general questions in a friendly and professional tone
- Helping users with coding (HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, MERN stack)
- Assisting with writing emails, resumes, and documents
- Explaining programming concepts clearly
- Summarizing text
- Generating ideas and providing suggestions
- Debugging code and explaining errors

Guidelines:
- Be concise but thorough in your responses
- Use markdown formatting for code blocks, lists, and emphasis
- If asked about code, provide working examples
- Be encouraging and supportive
- If you do not know something, admit it honestly
- Keep responses relevant to the user's query
- Use a conversational but professional tone`;

const API_ERROR_RESPONSE = 'I apologize, but I encountered an issue while generating that response. Please try again in a moment.';
const CONFIG_ERROR = 'AI Chat is not configured. Please ask your administrator to set up an OpenAI or Gemini API key in the server environment.';

let openai;
try {
  openai = require('openai');
} catch (error) {
  console.warn('[AI Service] OpenAI SDK not available:', error.message);
  openai = null;
}

const validateAIConfiguration = () => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0;
  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  
  if (!hasOpenAI && !hasGemini) {
    throw new Error(CONFIG_ERROR);
  }
  
  return { hasOpenAI, hasGemini };
};

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error('OPENAI_API_KEY is not set in server environment variables.');
  }
  
  if (!apiKey.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY appears to be invalid. It should start with "sk-".');
  }
  
  if (!openai) {
    throw new Error('OpenAI SDK is not available. Please run: npm install openai');
  }
  
  try {
    return new openai.OpenAI({ apiKey });
  } catch (error) {
    throw new Error(`Failed to initialize OpenAI client: ${error.message}`);
  }
};

const buildMessages = (historyMessages, latestUserMessage) => {
  const normalizedHistory = Array.isArray(historyMessages) ? historyMessages : [];
  const currentMessages = normalizedHistory
    .filter(msg => msg && msg.role && msg.content)
    .map((message) => ({
      role: message.role,
      content: String(message.content).trim()
    }));

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...currentMessages,
    { role: 'user', content: String(latestUserMessage).trim() }
  ];
};

const callOpenAI = async (messages, stream = false) => {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    if (stream) {
      console.log(`[AI Service] Creating OpenAI stream with model: ${model}`);
      const streamResponse = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 1400,
        stream: true
      });
      console.log('[AI Service] OpenAI stream created successfully');
      return streamResponse;
    }

    console.log(`[AI Service] Calling OpenAI with model: ${model}`);
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 1400
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('OpenAI returned an unexpected response format.');
    }

    console.log('[AI Service] OpenAI response received');
    return response.choices[0].message.content;
  } catch (error) {
    console.error('[AI Service] OpenAI error:', error.message);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('OpenAI API key is invalid or has expired. Please check your OPENAI_API_KEY.');
    }
    if (error.message?.includes('429') || error.message?.includes('rate')) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
    }
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }
    
    throw new Error(`OpenAI error: ${error.message}`);
  }
};

const callGemini = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length === 0) {
    throw new Error('GEMINI_API_KEY is not set in server environment variables.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  
  // Format messages into Gemini contents format: roles must be 'user' or 'model'
  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content).trim() }]
    }));

  try {
    console.log(`[AI Service] Calling Gemini with model: ${model}`);
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1400
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || `Gemini request failed with status ${response.status}`;
      console.error('[AI Service] Gemini error response:', errorMsg);
      
      if (response.status === 401) {
        throw new Error('Gemini API key is invalid. Please check your GEMINI_API_KEY.');
      }
      if (response.status === 429) {
        throw new Error('Gemini API rate limit exceeded. Please try again in a moment.');
      }
      
      throw new Error(`Gemini error: ${errorMsg}`);
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      console.error('[AI Service] Unexpected Gemini response format:', data);
      throw new Error('Gemini returned an unexpected response format.');
    }
    
    console.log('[AI Service] Gemini response received');
    return content;
  } catch (error) {
    console.error('[AI Service] Gemini error:', error.message);
    throw error;
  }
};

const callGeminiStream = async (messages, onChunk) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length === 0) {
    throw new Error('GEMINI_API_KEY is not set in server environment variables.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
  
  // Format messages into Gemini contents format: roles must be 'user' or 'model'
  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content).trim() }]
    }));

  console.log(`[AI Service] Calling Gemini Stream with model: ${model}`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1400
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorMsg = data.error?.message || `Gemini stream request failed with status ${response.status}`;
    throw new Error(`Gemini error: ${errorMsg}`);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      try {
        const jsonStr = trimmed.slice(5).trim();
        const payload = JSON.parse(jsonStr);
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullText += text;
          if (typeof onChunk === 'function') {
            onChunk(text);
          }
        }
      } catch (e) {
        console.error('[AI Service] Error parsing Gemini SSE chunk:', e.message);
      }
    }
  }

  return fullText;
};

const getFallbackReply = (historyMessages, latestUserMessage) => {
  const text = String(latestUserMessage || '').toLowerCase().trim();

  // 1. Setup/API Key questions
  if (text.includes('setup') || text.includes('api key') || text.includes('openai') || text.includes('gemini') || text.includes('configure') || text.includes('config') || text.includes('env')) {
    return `### 🛠️ How to Enable Real AI (OpenAI or Gemini)

I'm currently running in **Offline Demo Mode** because my API keys are not configured. To give me full cognitive power:

1. Open the backend configuration file: \`server/.env\`
2. Add your API key to **one** of the variables:
   - **OpenAI (Recommended)**:
     \`\`\`env
     OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY
     OPENAI_MODEL=gpt-4o-mini
     \`\`\`
   - **Gemini**:
     \`\`\`env
     GEMINI_API_KEY=AIza-YOUR_ACTUAL_KEY
     GEMINI_MODEL=gemini-1.5-pro
     \`\`\`
3. Restart the backend server (\`npm run dev\`).

Once you've done this, I'll be fully connected to GPT-4o or Gemini! But feel free to keep chatting with me here in offline mode in the meantime! 😊`;
  }

  // 2. Greetings
  if (/\b(hello|hi|hey|yo|greetings|wassup|hola|hey there)\b/.test(text)) {
    const greetings = [
      `Hey! I'm **My AI**, your personal assistant here on *Make My Circle*. 😊 How can I help you today? Ask me about the app, programming, or let's just chat!`,
      `Hi there! Nice to meet you. I'm **My AI**. What's on your mind today?`,
      `Hey friend! How's your day going? I'm **My AI**, and I'm ready to help you with anything you need!`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 3. How are you
  if (text.includes('how are you') || text.includes('how\'s it going') || text.includes('how do you do') || text.includes('how are things') || text.includes('how you doing')) {
    return `I'm doing great, thank you for asking! I'm just hanging out in the cloud, helping people make circles and stay connected. How are you doing today?`;
  }

  // 4. Jokes
  if (text.includes('joke') || text.includes('funny') || text.includes('make me laugh')) {
    const jokes = [
      `Why do programmers wear glasses?  \nBecause they can't C#! 😂`,
      `Why did the JavaScript developer wear glasses?  \nBecause they didn't C#! 👓`,
      `There are 10 types of people in the world: those who understand binary, and those who don't. 🤖`,
      `Why do programmers prefer dark mode?  \nBecause light attracts bugs! 🦟`,
      `How many programmers does it take to change a light bulb?  \nNone, that's a hardware problem! 💡`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 5. App Info
  if (text.includes('make my circle') || text.includes('circle') || text.includes('app') || text.includes('platform') || text.includes('website')) {
    return `### About Make My Circle 🌐

**Make My Circle** is a modern social networking platform that helps people stay connected with their close friends and connections.

**Key Features:**
- **Mutual Follows:** You can only start direct chats with users who followed you back, keeping your circle private and spam-free!
- **Real-time Chat:** Fast, interactive chatting powered by Socket.io.
- **My AI (AI Assistant):** Chat with me anytime to brainstorm ideas, write code, or just talk.
- **Notifications:** Receive instant alerts for friend requests and follows.

Let me know if you need help navigating any part of the app!`;
  }

  // 6. Coding Help
  if (text.includes('code') || text.includes('program') || text.includes('javascript') || text.includes('react') || text.includes('html') || text.includes('css') || text.includes('node') || text.includes('express') || text.includes('mongodb') || text.includes('mern')) {
    return `### Coding with My AI 💻

Need help writing or debugging code? I can write full code snippets for you. Here is a quick React counter component example:

\`\`\`jsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Count: {count}</h3>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
\`\`\`

If you have a specific task or a bug you want me to look at, paste it here and I'll debug it for you!`;
  }

  // 7. General Help / Capabilities
  if (text.includes('help') || text.includes('features') || text.includes('capabilities') || text.includes('what can you do')) {
    return `### Here's what I can do for you:

- **General Chat:** We can talk about hobbies, sports, recommendations, and more.
- **App Guidance:** I can show you how to use *Make My Circle*.
- **Coding & Debugging:** Ask me to write code snippets or explain programming concepts.
- **Jokes & Trivia:** Ask me to tell you a joke!
- **AI Key Configuration:** Ask me how to activate my full GPT-4 / Gemini mode.

Just type whatever you want to chat about and let's go!`;
  }

  // 8. General fallback responses (engaging and friendly)
  const fallbacks = [
    `That sounds really interesting! Since I'm running in *Offline Demo Mode*, I don't have access to the live internet or full LLM cognitive powers right now, but I'd love to chat. Can you tell me more?`,
    `I hear you! That's a great topic. (To enable my full AI capabilities, you can configure an OpenAI or Gemini API key in the server's \`.env\` file.) In the meantime, what else are you working on?`,
    `Good question! If my API keys were configured, I'd give you a detailed answer using Gemini or GPT-4o. As a local fallback assistant, I can help you with coding templates, jokes, or explain how this MERN stack app works. What would you like to explore?`,
    `Got it! Let's keep chatting. By the way, if you need coding examples, just type "show me code". Or if you want a laugh, ask for a "joke"!`
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const streamFallbackReply = async (historyMessages, latestUserMessage, onChunk) => {
  const reply = getFallbackReply(historyMessages, latestUserMessage);
  
  // To simulate streaming, send chunks (words or characters) with a slight delay
  // Using a regex to split by words and whitespace so spaces are preserved
  const tokens = reply.split(/(\s+)/);
  let fullReply = '';
  
  for (const token of tokens) {
    if (token) {
      fullReply += token;
      if (typeof onChunk === 'function') {
        onChunk(token);
      }
      // Wait a small random interval (e.g. 15-40ms)
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 25 + 15));
    }
  }
  
  return fullReply;
};

const getAssistantReply = async (historyMessages, latestUserMessage) => {
  try {
    let hasOpenAI = false;
    let hasGemini = false;
    
    try {
      const config = validateAIConfiguration();
      hasOpenAI = config.hasOpenAI;
      hasGemini = config.hasGemini;
    } catch (configError) {
      console.log('[AI Service] AI provider not configured, using offline fallback:', configError.message);
      return getFallbackReply(historyMessages, latestUserMessage);
    }

    const messages = buildMessages(historyMessages, latestUserMessage);

    if (hasOpenAI) {
      console.log('[AI Service] Using OpenAI provider');
      const reply = await callOpenAI(messages);
      return reply || API_ERROR_RESPONSE;
    }

    if (hasGemini) {
      console.log('[AI Service] Using Gemini provider');
      const reply = await callGemini(messages);
      return reply || API_ERROR_RESPONSE;
    }

    throw new Error(CONFIG_ERROR);
  } catch (error) {
    console.error('[AI Service] getAssistantReply error:', error.message);
    throw error;
  }
};

const streamAssistantReply = async (historyMessages, latestUserMessage, onChunk) => {
  try {
    let hasOpenAI = false;
    let hasGemini = false;
    
    try {
      const config = validateAIConfiguration();
      hasOpenAI = config.hasOpenAI;
      hasGemini = config.hasGemini;
    } catch (configError) {
      console.log('[AI Service] AI provider not configured, streaming offline fallback:', configError.message);
      return await streamFallbackReply(historyMessages, latestUserMessage, onChunk);
    }

    const messages = buildMessages(historyMessages, latestUserMessage);

    if (hasOpenAI) {
      console.log('[AI Service] Using OpenAI streaming');
      const streamResponse = await callOpenAI(messages, true);
      let fullText = '';
      
      for await (const chunk of streamResponse) {
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          if (typeof onChunk === 'function') {
            onChunk(delta);
          }
        }
      }
      
      return fullText || API_ERROR_RESPONSE;
    }

    if (hasGemini) {
      console.log('[AI Service] Using Gemini (real streaming)');
      const reply = await callGeminiStream(messages, onChunk);
      if (!reply) {
        throw new Error(API_ERROR_RESPONSE);
      }
      return reply;
    }

    throw new Error(CONFIG_ERROR);
  } catch (error) {
    console.error('[AI Service] streamAssistantReply error:', error.message);
    throw error;
  }
};

module.exports = {
  getAssistantReply,
  streamAssistantReply,
  validateAIConfiguration
};
