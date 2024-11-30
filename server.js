import express from 'express';
import fetch from 'node-fetch';  // If you're using fetch for API requests
import dotenv from 'dotenv';  // Import dotenv for environment variables
import cors from 'cors';  // To enable Cross-Origin Resource Sharing (CORS)

dotenv.config();  // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 10000;
console.log(process.env.OPENAI_API_KEY);

// Enable CORS for all origins (or specify domains if you need more control)
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Therapy Bot API');
});

// Chat endpoint that communicates with OpenAI
app.post('/api/chat', async (req, res) => {
    const responses = req.body.responses;  // Get responses from request body
    const openaiApiKey = process.env.OPENAI_API_KEY;  // Retrieve API key from environment

    if (!openaiApiKey) {
        return res.status(500).json({ error: 'API key is missing.' });
    }

    try {
        // Send request to OpenAI's API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,  // Authorization header with Bearer token
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',  // Model used for completions
                messages: [
                    { role: 'system', content: 'You are a helpful therapist.' },
                    { role: 'user', content: `User input: ${responses.join(', ')}` },  // Responses from user
                ],
                max_tokens: 100,  // Limit response length
            }),
        });

        // Check if OpenAI API returned an error
        if (!response.ok) {
            console.log('OpenAI API Error:', await response.text());  // Log OpenAI API error
            return res.status(response.status).json({ error: 'Error from OpenAI API.' });
        }

        // Get the response from OpenAI
        const data = await response.json();
        const therapyProfile = data.choices[0].message.content;  // Extract therapy profile from the response

        // Send the therapy profile to the frontend
        res.json({ profile: therapyProfile });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate profile. Please try again later.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
