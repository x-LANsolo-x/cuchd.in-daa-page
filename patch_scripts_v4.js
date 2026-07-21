const fs = require('fs');

const OLD_SCRIPT_MARKER = `<script id="dynamic-clubs-script">`;
const END_MARKER = `</script></body></html>`;

const NEW_SCRIPT = `<script id="dynamic-clubs-script">
    document.addEventListener("DOMContentLoaded", function() {
        // Fetching local clubs.json which matches the updated CSV structure
        fetch('./clubs.json')
            .then(response => response.json())
            .then(clubs => {
                const container = document.getElementById('dynamic-clubs-container');
                if(!container) return;

                const CATEGORY_ORDER = [
                    'Science, Technology & Innovation',
                    'Media, Culture & Communication',
                    'Social Impact & Community Development & Community Development',
                    'Business & Management'
                ];
                
                // Group clubs by category to maintain ordering
                const grouped = {};
                CATEGORY_ORDER.forEach(cat => grouped[cat] = []);
                clubs.forEach(club => {
                    const clubCat = club.category || '';
                    const matchedCat = CATEGORY_ORDER.find(c => c.toLowerCase() === clubCat.trim().toLowerCase());
                    if (matchedCat) {
                        grouped[matchedCat].push(club);
                    }
                });

                let html = '<div class="row w-100 m-0">';
                CATEGORY_ORDER.forEach(cat => {
                    const catClubs = grouped[cat];
                    if (!catClubs || catClubs.length === 0) return;

                    catClubs.forEach(club => {
                        const logoUrl = club.logo ? (club.logo.startsWith('http') ? club.logo : 'https://cuchd-in-daa-page.vercel.app/' + club.logo) : 'https://via.placeholder.com/150';
                        const categories = (club.categories || []).join(', ');
                        const media = (club.media || []).map(m => m.startsWith('http') ? m : 'https://cuchd-in-daa-page.vercel.app/' + m).join(',');

                        html += '<div class="col-sm-12 col-md-6 col-lg-3 mb-4 club-card-wrapper" data-cat="' + cat + '">' +
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
                               'data-hidemedia="' + (club.hideMediaColumn === true) + '" ' +
                               'data-members="' + (club.members || '').replace(/"/g, '&quot;') + '" ' +
                               'data-owner="' + (club.owner || '').replace(/"/g, '&quot;') + '" ' +
                               'data-title="' + (club.title || '').replace(/"/g, '&quot;') + '" ' +
                               'href="javascript:void(0);">' +
                                '<div class="pxp-areas-1-item-fig pxp-cover lazy-bg" style="background-image: url(\\\'' + logoUrl + '\\\'); background-color: #ffffff;"></div>' +
                                '<div class="pxp-areas-1-item-details">' +
                                    '<div class="pxp-areas-1-item-details-area">' + club.title + '</div>' +
                                    '<div class="pxp-areas-1-item-details-city">' + (club.shortDesc || '') + '</div>' +
                                '</div>' +
                            '</a>' +
                        '</div>';
                    });
                });
                html += '</div>';

                container.innerHTML = html;

                // Re-wire filter tabs to show/hide individual cards
                document.querySelectorAll('.testi-heading-new ul li a[data-filter]').forEach(function(tab) {
                    tab.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        document.querySelectorAll('.testi-heading-new ul li a[data-filter]').forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        var filterValue = this.getAttribute('data-filter');
                        document.querySelectorAll('.club-card-wrapper').forEach(function(card) {
                            if (filterValue === 'ALL' || card.getAttribute('data-cat') === filterValue) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    }, true);
                });
            })
            .catch(err => console.error("Error loading clubs:", err));
    });
</script></body></html>`;

const FILES = [
    './clubs.html',
    './clubv2.html',
    './erp_ready_portal/clubs.html',
    './erp_ready_portal/clubv2.html',
    './erp_clubs_only_portal/clubs.html',
    './erp_clubs_only_portal/clubv2.html',
];

FILES.forEach(file => {
    if (!fs.existsSync(file)) { console.log(`SKIP (not found): ${file}`); return; }
    let content = fs.readFileSync(file, 'utf8');
    const startIdx = content.indexOf(OLD_SCRIPT_MARKER);
    const endIdx = content.indexOf(END_MARKER);
    
    if (startIdx === -1 || endIdx === -1) {
        console.log(`SKIP (script bounds not found): ${file}`);
        return;
    }
    
    // Replace script
    content = content.substring(0, startIdx) + NEW_SCRIPT;
    fs.writeFileSync(file, content);
    console.log(`Patched: ${file}`);
});
