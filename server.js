// server.js - Local development server using Express

const express = require('express');
const { authorize, readActiveTab } = require('./sync');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Example API endpoint for reading Active tab
app.get('/api/read-active', async (req, res) => {
    const { spreadsheetId } = req.query;
    if (!spreadsheetId) {
        return res.status(400).json({ error: 'spreadsheetId is required' });
    }
    try {
        const data = await readActiveTab(spreadsheetId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// TODO: Add more endpoints for write, search, etc.

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 