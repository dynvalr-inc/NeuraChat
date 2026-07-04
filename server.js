require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

app.post('/chat', async (req, res) => {
    const userMessage = req.body.userMessage;
    const chatHistory = Array.isArray(req.body.chatHistory) ? req.body.chatHistory : []; 
    
    // Use a model known to support tools
    // Use this specific model ID which is free and supports tools
    const selectedModel = "meta-llama/llama-3.3-70b-instruct:free"; 
    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

    const today = new Date().toLocaleDateString();
    const systemInstruction = { 
        role: "system", 
        content: `Your name is NeuraChat. You are a helpful AI assistant. Today's date is ${today}. You have access to the web search tool to answer questions about current events or facts you don't know.` 
    };

    const allMessages = [systemInstruction, ...chatHistory, { role: "user", content: userMessage }];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://your-site-url.onrender.com", 
                "X-Title": "NeuraChat" 
            },
            body: JSON.stringify({ 
                model: selectedModel, 
                messages: allMessages,
                // Add the Web Search Tool here!
                tools: [{ type: "openrouter:web_search" }] 
            })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return res.json({ reply: `⚠️ API Error: ${data.error?.message || 'Unknown error'}` });
        }

        const aiReply = data.choices[0].message.content;
        res.json({ reply: aiReply });

    } catch (error) {
        console.error("Server Error:", error);
        res.json({ reply: "⚠️ Server Error: Could not connect to API." });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
