// importData.js - Import sample data from Dashboard Clone.xlsx to Google Sheets

const XLSX = require('xlsx');
const { google } = require('googleapis');
const { authorize } = require('./sync');

async function importToSheets() {
    try {
        const auth = await authorize();
        const sheets = google.sheets({version: 'v4', auth});

        // Create new spreadsheet
        const createRes = await sheets.spreadsheets.create({
            resource: {
                properties: { title: 'Hospice Dashboard Clone' },
            },
            fields: 'spreadsheetId'
        });
        const spreadsheetId = createRes.data.spreadsheetId;
        console.log(`Spreadsheet created: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

        // Read Excel file
        const workbook = XLSX.readFile('Dashboard Clone.xlsx');
        const sheetNames = workbook.SheetNames;

        // Rename default sheet to first sheet name
        const firstSheetName = sheetNames[0];
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [{
                    updateSheetProperties: {
                        properties: {
                            sheetId: 0, // Default sheet ID
                            title: firstSheetName
                        },
                        fields: 'title'
                    }
                }]
            }
        });

        // Add remaining sheets
        const addSheetRequests = sheetNames.slice(1).map(name => ({
            addSheet: {
                properties: { title: name }
            }
        }));
        if (addSheetRequests.length > 0) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: { requests: addSheetRequests }
            });
        }

        // Populate data for each sheet
        for (const sheetName of sheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: ''});
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                resource: { values: data }
            });
        }

        console.log('Data imported successfully.');
    } catch (err) {
        console.error('Error importing data:', err);
    }
}

importToSheets(); 