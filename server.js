require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files from current directory
app.use(cors()); // Enable CORS for all routes

// Dify API endpoint
app.post('/api/dify', async (req, res) => {
    const difyUrl = 'https://api.dify.ai/v1/workflows/run';
    const difyApiKey = process.env.DIFY_API_KEY;

    if (!difyApiKey) {
        return res.status(500).json({ error: 'Dify API key not configured.' });
    }

    try {
        const response = await fetch(difyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${difyApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Dify API raw response:', JSON.stringify(data, null, 2));
        res.json(data);
    } catch (error) {
        console.error('Error proxying to Dify API:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});