// addChatTab.js - Add Chat tab to Dashboard Clone.xlsx for team communication

const XLSX = require('xlsx');
const fs = require('fs');

function addChatTab() {
    try {
        // Read existing Excel file
        const workbook = XLSX.readFile('Dashboard Clone.xlsx');
        
        // Sample chat data structure
        const chatData = [
            // Headers
            ['Timestamp', 'User', 'Message', 'Type', 'Recipients', 'Status'],
            
            // Sample chat messages
            ['20241201143000', 'Alyssa', 'Hey team, where are we on the Johnson case?', 'question', 'all', 'active'],
            ['20241201143100', 'Dr. Moore', 'I just reviewed the medication list, all looks good', 'update', 'all', 'active'],
            ['20241201143200', 'Christa', 'Family meeting scheduled for tomorrow at 2pm', 'info', 'all', 'active'],
            ['20241201143300', 'Amber', 'Insurance approval came through!', 'good_news', 'all', 'active'],
            ['20241201143400', 'Alyssa', 'Great work everyone!', 'comment', 'all', 'active'],
            ['20241201143500', 'Dr. Moore', '@Christa - can you prep the meeting notes?', 'task', 'Christa', 'active'],
            ['20241201143600', 'Christa', 'On it! Will have them ready by EOD', 'response', 'Dr. Moore', 'active'],
            ['20241201143700', 'Amber', '@Alyssa - need your input on the billing codes', 'question', 'Alyssa', 'active'],
            ['20241201143800', 'Alyssa', 'I\'ll review and get back to you by 5pm', 'response', 'Amber', 'active']
        ];
        
        // Create worksheet from data
        const worksheet = XLSX.utils.aoa_to_sheet(chatData);
        
        // Add the Chat worksheet to workbook
        workbook.SheetNames.push('Chat');
        workbook.Sheets['Chat'] = worksheet;
        
        // Write back to file
        XLSX.writeFile(workbook, 'Dashboard Clone.xlsx');
        
        console.log('✅ Chat tab added successfully!');
        console.log('📝 Sample messages added:');
        console.log('   - Team coordination messages');
        console.log('   - Task assignments with @mentions');
        console.log('   - Status updates and questions');
        console.log('   - Timestamp format: YYYYMMDDHHMMSS');
        
    } catch (error) {
        console.error('❌ Error adding Chat tab:', error.message);
    }
}

addChatTab(); 