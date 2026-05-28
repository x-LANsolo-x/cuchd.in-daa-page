const fs = require('fs');

const clubsDataPath = './clubs.json';
const outputCsvPath = './clubs_data.csv';

// Read JSON data
const rawData = fs.readFileSync(clubsDataPath, 'utf-8');
const clubs = JSON.parse(rawData);

// Utility to escape CSV fields
function escapeCSV(field) {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// CSV Header
const headers = ['Logo Link', 'Club Name', 'Club Description', 'Club Categories'];
const rows = [headers.map(escapeCSV).join(',')];

const BASE_URL = 'https://cuchd-in-daa-page.vercel.app/';

for (const club of clubs) {
    const logoLink = club.logo ? `${BASE_URL}${encodeURI(club.logo)}` : '';
    const clubName = club.title || '';
    const clubDescription = club.longDesc || club.shortDesc || '';
    const clubCategories = Array.isArray(club.categories) ? club.categories.join(', ') : '';

    rows.push([
        logoLink,
        clubName,
        clubDescription,
        clubCategories
    ].map(escapeCSV).join(','));
}

fs.writeFileSync(outputCsvPath, rows.join('\n'), 'utf-8');
console.log(`Successfully created ${outputCsvPath} with ${clubs.length} clubs.`);
