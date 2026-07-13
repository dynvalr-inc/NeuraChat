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
    
    const selectedModel = "openrouter/free"; 
    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

    const today = new Date().toLocaleDateString();
    const systemInstruction = { 
        role: "system", 
        content: `Your name is NeuraChat. Today's date is ${today}.` 
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
            body: JSON.stringify({ model: selectedModel, messages: allMessages })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("OpenRouter Error Details:", data);
            return res.json({ reply: `⚠️ API Error: ${data.error?.message || 'Unknown error'}` });
        }

        const aiReply = data.choices[0].message.content;
        
        // --- ADDED: Include the timestamp in the JSON response ---
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        res.json({ reply: aiReply, timestamp: timestamp });

    } catch (error) {
        console.error("Server Error:", error);
        res.json({ reply: "⚠️ Server Error: Could not connect to API." });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
