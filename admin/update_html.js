const fs = require('fs');
const cheerio = require('cheerio');

const filesToUpdate = ['../clubs.html', '../clubv2.html'];

filesToUpdate.forEach(file => {
    try {
        if (!fs.existsSync(file)) return;
        
        let htmlContent = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(htmlContent);

        // Find all elements containing a club item
        const items = $('.pxp-areas-1-item').closest('.col-sm-12.col-md-6.col-lg-3.mb-4');
        
        if (items.length > 0) {
            const container = items.first().parent('.row');
            container.attr('id', 'dynamic-clubs-container');
            
            // Remove all hardcoded items
            items.remove();

            // Append the dynamic loading script if not already present
            if ($('script#dynamic-clubs-script').length === 0) {
                const scriptContent = `
    document.addEventListener("DOMContentLoaded", function() {
        fetch('clubs.json')
            .then(response => response.json())
            .then(clubs => {
                const container = document.getElementById('dynamic-clubs-container');
                if(!container) return;
                
                let html = '';
                clubs.forEach(club => {
                    const logoUrl = club.logo || 'https://via.placeholder.com/150';
                    const categories = (club.categories || []).join(', ');
                    const media = (club.media || []).join(',');
                    
                    html += '<div class="col-sm-12 col-md-6 col-lg-3 mb-4">' +
                        '<a class="pxp-areas-1-item rounded-lg" ' +
                           'data-bs-target="#clubModal" ' +
                           'data-bs-toggle="modal" ' +
                           'data-categories="' + categories.replace(/"/g, '&quot;') + '" ' +
                           'data-club-category="' + (club.category || '').replace(/"/g, '&quot;') + '" ' +
                           'data-contact="' + (club.contact || '').replace(/"/g, '&quot;') + '" ' +
                           'data-desc="' + (club.shortDesc || '').replace(/"/g, '&quot;') + '" ' +
                           'data-faculty="' + (club.faculty || '').replace(/"/g, '&quot;') + '" ' +
                           'data-img="' + logoUrl + '" ' +
                           'data-longdesc="' + (club.longDesc || '').replace(/"/g, '&quot;') + '" ' +
                           'data-media="' + media + '" ' +
                           'data-members="' + (club.members || '').replace(/"/g, '&quot;') + '" ' +
                           'data-owner="' + (club.owner || '').replace(/"/g, '&quot;') + '" ' +
                           'data-title="' + (club.title || '').replace(/"/g, '&quot;') + '" ' +
                           'href="javascript:void(0);">' +
                            '<div class="pxp-areas-1-item-fig pxp-cover lazy-bg" style="background-image: url(\\'' + logoUrl + '\\'); background-color: #ffffff;"></div>' +
                            '<div class="pxp-areas-1-item-details">' +
                                '<div class="pxp-areas-1-item-details-area">' + club.title + '</div>' +
                                '<div class="pxp-areas-1-item-details-city">' + (club.shortDesc || '') + '</div>' +
                            '</div>' +
                        '</a>' +
                    '</div>';
                });
                container.innerHTML = html;
            })
            .catch(err => console.error("Error loading clubs:", err));
    });
`;
                $('body').append('<script id="dynamic-clubs-script">' + scriptContent + '</script>');
            }

            fs.writeFileSync(file, $.html());
            console.log("Successfully updated " + file);
        } else {
            console.log("No hardcoded clubs found in " + file);
        }
    } catch (err) {
        console.error("Error processing " + file + ":", err);
    }
});
