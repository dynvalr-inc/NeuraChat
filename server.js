require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const chatHistory = req.body.history || []; // Get previous messages
    const selectedModel = req.body.model || "google/gemini-2.0-flash-lite-001";
    const apiKey = process.env.OPENROUTER_API_KEY || "";

    // 1. Define the AI's identity
    const systemInstruction = { 
        role: "system", 
        content: "Your name is NeuraChat. You are a helpful and friendly AI assistant created by Vipul. Always identify as NeuraChat." 
    };

    // 2. Combine: Identity + History + New User Message
    const allMessages = [
        systemInstruction,
        ...chatHistory, 
        { role: "user", content: userMessage }
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: allMessages // Use the combined list here
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error connecting to API");
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
