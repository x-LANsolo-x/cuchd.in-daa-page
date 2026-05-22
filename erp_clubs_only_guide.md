# ERP Integration Guide: CU Clubs Portal (Clubs Pages Only)

This document provides instructions for integrating the "Clubs Pages Only" package (`erp_clubs_only_portal.zip`) into your ERP ecosystem. This package is a lightweight, stripped-down version containing *only* the user-facing club portals and their direct dependencies.

## 1. Directory Structure Overview
- `clubs.html` & `clubv2.html`: The user-facing portal pages to be integrated into your site hierarchy.
- `clubs.json`: The single source of truth database. The HTML pages read directly from this file via `fetch()`.
- `latest-assets/`, `new-assets/`, `campus-life/`, `includes/`: Essential CSS/JS layout dependencies.
- `logos/` & `media/`: Stored images for the clubs.

*(Note: The Admin dashboard and backend API scripts have been intentionally omitted from this package to maintain isolation.)*

## 2. Integration Strategy

This package is completely static. You can extract it into any sub-directory on your web server (e.g., `https://your-domain.edu/erp/clubs/`). 

### Locational Independence
All asset references within the HTML files use relative paths (`./logos/`, `./includes/`, etc.). There are no hardcoded absolute links. The portal will function perfectly regardless of what folder level it is dropped into.

### Managing Data (`clubs.json`)
The entire state of the portal is driven by `clubs.json`. To modify the clubs displayed on `clubs.html` or `clubv2.html`, you only need to update `clubs.json`. 

Since the admin panel is not included in this package, data updates should be managed by the central admin team who retains access to the dashboard. They will provide you with the updated `clubs.json` file whenever changes are made. Alternatively, if you plan to build a custom ERP backend, simply ensure that your ERP logic writes the latest club data to this `clubs.json` file on the server.

## 3. Server Configuration
No specialized Node.js or Python server environment is needed. You can serve this package using a standard Apache, Nginx, or IIS configuration. 

Ensure your server is configured to correctly serve `.json`, `.webp`, `.css`, and `.js` MIME types.
