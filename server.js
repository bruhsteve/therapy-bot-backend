require('dotenv').config(); // To load environment variables from .env file
const express = require('express');
const fetch = require('node-fetch'); // or use axios for making HTTP requests
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { responses } = req.body;
    const API_KEY = process.env.OPENAI_API_KEY;

    try {
        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // or use 'gpt-4' if needed
                messages: [
                    { role: 'system', content: 'You are a helpful therapist.' },
                    { role: 'user', content: `User input: ${responses.join(', ')}` },
                ],
                max_tokens: 100, // Adjust the token limit as needed
            }),
        });

        if (!openAiResponse.ok) {
            throw new Error('OpenAI API request failed');
        }

        const data = await openAiResponse.json();
        const therapyProfile = data.choices[0].message.content; // Extract OpenAI response

        res.json({ profile: therapyProfile });
    } catch (error) {
        console.error('Error with OpenAI request:', error);
        res.status(500).json({ error: 'Failed to generate therapy profile' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
