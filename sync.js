// sync.js - Google Sheets API setup

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const XLSX = require('xlsx');

/**
 * OAuth Instructions:
 * 1. Go to https://console.cloud.google.com/ and create a new project.
 * 2. Enable the Google Sheets API.
 * 3. Create OAuth 2.0 Client IDs (select 'Desktop app').
 * 4. Download the client_secret.json and rename it to credentials.json in the project root.
 * 5. Run a script or the server to generate the token.json by authorizing via the generated URL.
 * 6. Paste the authorization code back into the prompt.
 * Note: For security, never commit credentials.json or token.json.
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function authorize() {
    let client;
    const content = await fs.readFile('credentials.json');
    const credentials = JSON.parse(content);
    client = new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0]
    );

    try {
        const token = await fs.readFile(TOKEN_PATH);
        client.setCredentials(JSON.parse(token));
    } catch (err) {
        return getNewToken(client);
    }
    return client;
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    // In a real script, use readline to get the code from user
    // For now, this is a placeholder - user must manually authorize and save token
    throw new Error('Please authorize the app and save the token to token.json manually.');
}

async function readActiveTab(spreadsheetId) {
    const localFilePath = path.join(__dirname, 'Dashboard Clone.xlsx');
    
    try {
        // Check if file exists
        await fs.access(localFilePath);
        console.log('Local file found, reading from Dashboard Clone.xlsx');
        
        // Read the Excel file
        const workbook = XLSX.readFile(localFilePath);
        console.log('Available sheets:', workbook.SheetNames);
        
        // Get the Active sheet
        const worksheet = workbook.Sheets['Active'];
        if (!worksheet) {
            throw new Error('Active sheet not found in local file. Available sheets: ' + workbook.SheetNames.join(', '));
        }
        
        // Convert sheet to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: null});
        if (!rows || rows.length === 0) {
            console.log('No data found in Active sheet.');
            return [];
        }
        
        console.log(`Found ${rows.length} rows in Active sheet`);
        const headers = rows[0];
        console.log('Headers:', headers);
        
        // Convert rows to objects
        const data = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = row[i] !== undefined ? row[i] : null;
            });
            return obj;
        });
        
        console.log(`Processed ${data.length} data rows`);
        return data;
        
    } catch (err) {
        console.error('Error reading local XLSX file:', err);
        if (err.code === 'ENOENT') {
            throw new Error('Dashboard Clone.xlsx file not found in project root. Please ensure the file exists.');
        }
        throw new Error(`Failed to read local XLSX file: ${err.message}`);
    }
}

module.exports = { authorize, readActiveTab }; 