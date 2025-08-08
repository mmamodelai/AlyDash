// updateChatSystem.js - Update Chat tab with DM/Group message support and user coding

const XLSX = require('xlsx');
const fs = require('fs');

function updateChatSystem() {
    try {
        // Read existing Excel file
        const workbook = XLSX.readFile('Dashboard Clone.xlsx');
        
        // Updated chat data structure with DM/Group support
        const chatData = [
            // Headers
            ['Timestamp', 'Type', 'Participants', 'Sender', 'Message', 'Status', 'Tags'],
            
            // Sample messages with new coding system
            ['20241201143000', 'GM', '<Alyssa><Dr. Moore><Christa><Amber>', 'Alyssa', 'Hey team, where are we on the Johnson case?', 'active', 'patient-update'],
            ['20241201143100', 'GM', '<Alyssa><Dr. Moore><Christa><Amber>', 'Dr. Moore', 'I just reviewed the medication list, all looks good', 'active', 'medical-review'],
            ['20241201143200', 'DM', '<Alyssa><Christa>', 'Christa', 'Family meeting scheduled for tomorrow at 2pm', 'active', 'meeting'],
            ['20241201143300', 'DM', '<Alyssa><Amber>', 'Alyssa', 'Hey Amber, can you prep the meeting notes?', 'active', 'task'],
            ['20241201143400', 'GM', '<Alyssa><Dr. Moore><Christa><Amber>', 'Amber', 'Welcome Amber! Please connect with Alyssa on this new project', 'active', 'onboarding'],
            ['20241201143500', 'DM', '<Dr. Moore><Christa>', 'Dr. Moore', 'Christa, can you review the Johnson medication schedule?', 'active', 'medical-task'],
            ['20241201143600', 'GM', '<Alyssa><Dr. Moore><Christa><Amber>', 'Alyssa', 'Insurance approval came through for the Smith family!', 'active', 'good-news'],
            ['20241201143700', 'DM', '<Alyssa><Donnie>', 'Alyssa', 'Hey Donnie, lets get Amber onboarded properly', 'active', 'onboarding'],
            ['20241201143800', 'GM', '<Alyssa><Donnie><Amber>', 'Donnie', 'Welcome Amber! Please connect with Alyssa on this new project', 'active', 'welcome'],
            ['20241201143900', 'NOTE', '<Alyssa>', 'Alyssa', 'Patient timeline updated - family meeting scheduled', 'active', 'patient-timeline'],
            ['20241201144000', 'NOTE', '<Dr. Moore>', 'Dr. Moore', 'Medication review completed - no changes needed', 'active', 'medical-note'],
            ['20241201144100', 'DM', '<Christa><Amber>', 'Christa', 'Amber, here are the key contacts for the Johnson case', 'active', 'contacts'],
            ['20241201144200', 'GM', '<Alyssa><Dr. Moore><Christa><Amber>', 'Amber', 'Thanks everyone! Excited to be part of the team', 'active', 'introduction']
        ];
        
        // Update or create the Chat sheet
        const worksheet = XLSX.utils.aoa_to_sheet(chatData);
        workbook.Sheets['Chat'] = worksheet;
        
        // Write back to file
        XLSX.writeFile(workbook, 'Dashboard Clone.xlsx');
        
        console.log('✅ Chat system updated successfully!');
        console.log('📋 New features:');
        console.log('   - DM (Direct Messages)');
        console.log('   - GM (Group Messages)');
        console.log('   - NOTE (Personal Notes)');
        console.log('   - User coding: <Alyssa><Dr. Moore><Christa><Amber>');
        console.log('   - Tags for categorization');
        
    } catch (error) {
        console.error('❌ Error updating chat system:', error);
    }
}

updateChatSystem(); 