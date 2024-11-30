import express from 'express';
import fetch from 'node-fetch';  // If you're using fetch for API requests
import dotenv from 'dotenv';  // Import dotenv for environment variables

dotenv.config();  // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Chat endpoint that communicates with OpenAI
app.post('/api/chat', async (req, res) => {
    const responses = req.body.responses;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful therapist.' },
                    { role: 'user', content: `User input: ${responses.join(', ')}` },
                ],
                max_tokens: 100,
            }),
        });

        const data = await response.json();
        const therapyProfile = data.choices[0].message.content; // Extract profile from response

        res.json({ profile: therapyProfile });  // Send back to frontend
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate profile' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
