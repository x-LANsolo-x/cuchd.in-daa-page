const fs = require('fs');
const cheerio = require('cheerio');

const htmlFilePath = '../clubs.html';
const jsonFilePath = '../clubs.json';

try {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    const $ = cheerio.load(htmlContent);

    const clubs = [];

    $('.pxp-areas-1-item').each((i, element) => {
        const el = $(element);
        
        // Find the img logo inside the element or inside the figure
        const figEl = el.next('.pxp-areas-1-item-fig');
        let logo = el.attr('data-img') || '';
        if (!logo && figEl.length) {
            logo = figEl.attr('data-bg') || '';
        }

        const clubData = {
            id: el.attr('data-title') ? el.attr('data-title').replace(/\s+/g, '-').toLowerCase() : 'club-' + i,
            title: el.attr('data-title') || '',
            category: el.attr('data-club-category') || '',
            categories: el.attr('data-categories') ? el.attr('data-categories').split(',').map(c => c.trim()) : [],
            contact: el.attr('data-contact') || '',
            faculty: el.attr('data-faculty') || '',
            members: el.attr('data-members') || '',
            owner: el.attr('data-owner') || '',
            shortDesc: el.attr('data-desc') || '',
            longDesc: el.attr('data-longdesc') || '',
            media: el.attr('data-media') ? el.attr('data-media').split(',').map(m => m.trim()).filter(m => m) : [],
            logo: logo
        };

        clubs.push(clubData);
    });

    fs.writeFileSync(jsonFilePath, JSON.stringify(clubs, null, 2));
    console.log(`Successfully extracted ${clubs.length} clubs to ${jsonFilePath}`);
} catch (error) {
    console.error('Error extracting clubs:', error);
}
