# ERP Integration Guide: Full CU Clubs Portal

This document provides instructions for integrating the "Full Portal" package (`erp_ready_portal.zip`) into your ERP or university ecosystem. This package contains the entire suite of front-end pages, including the admin dashboard.

## 1. Directory Structure Overview
- `clubs.html` & `clubv2.html`: Main user-facing portals for exploring clubs.
- `index.html`, `communities.html`, `departmental-societies.html`, `professional-societies.html`: Related university life pages.
- `clubs.json`: The single source of truth database. All portal pages read from this file.
- `admin/`: The front-end admin dashboard used for updating `clubs.json`.
- `api/`: Vercel serverless functions (Node.js) currently used by the admin dashboard to authenticate and push updates directly to GitHub.
- `latest-assets/`, `new-assets/`, `campus-life/`, `includes/`: Essential CSS/JS dependencies.
- `logos/` & `media/`: Stored images for the clubs.

## 2. Integration Strategy

The portal is designed to be fully static and locational-independent. You can extract the contents into any sub-directory on your web server (e.g., `https://your-domain.edu/erp/student-life/`). All internal file references are relative (`./`) and will resolve correctly without any configuration.

### Serving the Content
No specialized Node.js or Python server is required to serve the frontend pages. You can use standard Apache, Nginx, or IIS configurations to serve the HTML.

### Managing Data (`clubs.json`)
The entire application state is driven by `clubs.json`. To modify the clubs displayed on the portal, you only need to overwrite `clubs.json`.

## 3. Adapting the Admin Dashboard
By default, the included `admin/app.js` sends REST requests to `/api/clubs` and `/api/upload` to securely modify the GitHub repository via Vercel serverless functions. 

Because you are integrating this into an ERP system, you will likely want to replace this GitHub-based storage with your own database (e.g., MySQL/PostgreSQL).

**Steps to adapt the admin panel to your backend:**
1. Ignore or delete the `api/` folder.
2. Open `admin/app.js`.
3. Locate the `saveClubsData()` and `uploadFile()` functions.
4. Modify the `fetch()` calls to hit your ERP's custom API endpoints (e.g., PHP or Java controllers).
5. Ensure your ERP's API endpoint writes the updated JSON payload to `clubs.json` on the server so that `clubs.html` automatically reflects the changes.

## 4. Security Notes
- The provided code contains no hardcoded API keys, secrets, or GitHub tokens.
- Ensure that the `/admin` folder is placed behind your ERP's authentication middleware to prevent unauthorized students from modifying club data.
