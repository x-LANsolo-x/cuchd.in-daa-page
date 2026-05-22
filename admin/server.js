const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from Panel directory so we can preview and edit
app.use(express.static(path.join(__dirname, '../')));

const clubsJsonPath = path.join(__dirname, '../clubs.json');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'logo') {
            cb(null, path.join(__dirname, '../logos'));
        } else if (file.fieldname === 'media') {
            // Need a specific folder for media based on club id?
            const clubId = req.body.id || req.params.id || 'general';
            const mediaDir = path.join(__dirname, '../media', clubId);
            if (!fs.existsSync(mediaDir)){
                fs.mkdirSync(mediaDir, { recursive: true });
            }
            cb(null, mediaDir);
        } else {
            cb(null, path.join(__dirname, '../media'));
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API Endpoints

// Get all clubs
app.get('/api/clubs', (req, res) => {
    try {
        const data = fs.readFileSync(clubsJsonPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read clubs data' });
    }
});

// Save all clubs
app.post('/api/clubs', (req, res) => {
    try {
        fs.writeFileSync(clubsJsonPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Clubs updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save clubs data' });
    }
});

// Upload Logo
app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `logos/${req.file.filename}`;
    res.json({ success: true, filePath });
});

// Upload Media
app.post('/api/upload/media', upload.array('media', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    const clubId = req.body.id || 'general';
    const filePaths = req.files.map(file => `media/${clubId}/${file.filename}`);
    res.json({ success: true, filePaths });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}/admin/index.html`);
});
