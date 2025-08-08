// addVendorsTab.js - Add Vendors tab to Dashboard Clone.xlsx with sample service partner data

const XLSX = require('xlsx');
const fs = require('fs');

function addVendorsTab() {
    try {
        // Read existing Excel file
        const workbook = XLSX.readFile('Dashboard Clone.xlsx');
        
        // Sample vendor data with categories for hospice/end-of-life services
        const vendorsData = [
            // Headers
            ['Vendor ID', 'Company Name', 'Category', 'Service Type', 'Contact Person', 'Phone', 'Email', 'Address', 'Website', 'Notes', 'Rating', 'Last Contact', 'Status'],
            
            // Sample vendors - 6 companies across different service categories
            ['V001', 'Serenity Cremation Services', 'Cremation', 'Cremation & Memorial', 'Sarah Johnson', '(555) 123-4567', 'sarah@serenitycremation.com', '123 Peaceful Lane, Riverside, CA 92501', 'www.serenitycremation.com', 'Reliable service, good pricing', '4.8', '2024-01-15', 'Active'],
            
            ['V002', 'Compassionate Care Pharmacies', 'Pharmacy', 'Hospice Medications', 'Dr. Michael Chen', '(555) 234-5678', 'mchen@compcarepharm.com', '456 Medical Plaza, Riverside, CA 92503', 'www.compcarepharm.com', 'Specializes in pain management meds', '4.9', '2024-01-20', 'Active'],
            
            ['V003', 'Gentle Hands Doula Services', 'Doula', 'End-of-Life Support', 'Maria Rodriguez', '(555) 345-6789', 'maria@gentlehands.com', '789 Comfort Way, Riverside, CA 92505', 'www.gentlehands.com', 'Excellent bedside manner, 24/7 availability', '5.0', '2024-01-18', 'Active'],
            
            ['V004', 'Eternal Rest Funeral Home', 'Funeral Services', 'Funeral & Memorial', 'Robert Williams', '(555) 456-7890', 'rwilliams@eternalrest.com', '321 Memorial Drive, Riverside, CA 92507', 'www.eternalrest.com', 'Traditional services, family-owned', '4.7', '2024-01-12', 'Active'],
            
            ['V005', 'Hospice Equipment Supply Co.', 'Medical Equipment', 'Durable Medical Equipment', 'Jennifer Davis', '(555) 567-8901', 'jdavis@hospiceequipment.com', '654 Medical Supply Blvd, Riverside, CA 92509', 'www.hospiceequipment.com', 'Quick delivery, wide selection', '4.6', '2024-01-22', 'Active'],
            
            ['V006', 'Peaceful Transitions Counseling', 'Counseling', 'Grief & Bereavement', 'Dr. Lisa Thompson', '(555) 678-9012', 'lthompson@peacefultransitions.com', '987 Healing Circle, Riverside, CA 92511', 'www.peacefultransitions.com', 'Licensed therapists, sliding scale fees', '4.9', '2024-01-16', 'Active']
        ];

        // Create new worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(vendorsData);
        
        // Add the Vendors sheet to the workbook
        workbook.SheetNames.push('Vendors');
        workbook.Sheets['Vendors'] = worksheet;

        // Write back to file
        XLSX.writeFile(workbook, 'Dashboard Clone.xlsx');
        
        console.log('✅ Vendors tab added successfully!');
        console.log('📋 Added 6 sample service partner companies:');
        console.log('   • Serenity Cremation Services (Cremation)');
        console.log('   • Compassionate Care Pharmacies (Pharmacy)');
        console.log('   • Gentle Hands Doula Services (Doula)');
        console.log('   • Eternal Rest Funeral Home (Funeral Services)');
        console.log('   • Hospice Equipment Supply Co. (Medical Equipment)');
        console.log('   • Peaceful Transitions Counseling (Counseling)');
        console.log('\n📊 Categories included: Cremation, Pharmacy, Doula, Funeral Services, Medical Equipment, Counseling');
        console.log('\n💡 You can now assign these vendors to patients in your Active tab!');
        
    } catch (error) {
        console.error('❌ Error adding Vendors tab:', error.message);
    }
}

// Run the function
addVendorsTab(); 