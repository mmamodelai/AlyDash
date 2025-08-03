// server.js - Local development server using Express

const express = require('express');
const { authorize, readActiveTab, readVendorsTab, readChatTab, addChatMessage } = require('./sync');

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

// API endpoint for reading Vendors tab
app.get('/api/read-vendors', async (req, res) => {
    const { spreadsheetId } = req.query;
    if (!spreadsheetId) {
        return res.status(400).json({ error: 'spreadsheetId is required' });
    }
    try {
        const data = await readVendorsTab(spreadsheetId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read vendors data' });
    }
});

// API endpoint for reading Chat tab
app.get('/api/read-chat', async (req, res) => {
    const { spreadsheetId } = req.query;
    if (!spreadsheetId) {
        return res.status(400).json({ error: 'spreadsheetId is required' });
    }
    try {
        const data = await readChatTab(spreadsheetId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read chat data' });
    }
});

// API endpoint for adding chat message
app.post('/api/add-chat-message', express.json(), async (req, res) => {
    try {
        const { user, message, type, recipients } = req.body;
        
        if (!user || !message) {
            return res.status(400).json({ error: 'User and message are required' });
        }
        
        const result = await addChatMessage({ user, message, type, recipients });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add chat message' });
    }
});

// TODO: Add more endpoints for write, search, etc.

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 