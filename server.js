require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // This serves your HTML file

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const selectedModel = req.body.model || "google/gemini-2.0-flash-001";
    // The server uses the secret key from .env
    const apiKey = process.env.OPENROUTER_API_KEY;

    // This is where the server talks to OpenRouter for the user
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
	body: JSON.stringify({
	    model: selectedModel,
	    messages: [{ role: "user", content: userMessage }] 
	})
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send("Error connecting to API");
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));