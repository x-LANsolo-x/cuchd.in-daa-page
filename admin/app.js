let clubsData = [];
const API_URL = '/api';

const clubModal = new bootstrap.Modal(document.getElementById('clubModal'));

// Load clubs on start
async function loadClubs() {
    try {
        const res = await fetch(`${API_URL}/clubs`);
        clubsData = await res.json();
        renderTable();
    } catch (e) {
        showAlert('Error loading clubs data', 'danger');
    }
}

function renderTable() {
    const tbody = document.getElementById('clubsTableBody');
    tbody.innerHTML = '';
    
    clubsData.forEach((club, index) => {
        const logoUrl = club.logo ? `../${club.logo}` : 'https://via.placeholder.com/50';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${logoUrl}" class="logo-preview" alt="logo" loading="lazy"></td>
            <td class="fw-bold">${club.title}</td>
            <td><span class="badge bg-secondary">${club.category}</span></td>
            <td>${club.faculty || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editClub(${index})">Edit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddModal() {
    document.getElementById('clubForm').reset();
    document.getElementById('clubId').value = '';
    document.getElementById('clubLogoPath').value = '';
    document.getElementById('clubMediaPaths').value = '';
    document.getElementById('logoPreviewContainer').innerHTML = '';
    document.getElementById('mediaPreviewContainer').innerHTML = '';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('clubModalLabel').innerText = 'Add New Club';
    clubModal.show();
}

function editClub(index) {
    const club = clubsData[index];
    document.getElementById('clubId').value = club.id;
    document.getElementById('clubTitle').value = club.title;
    document.getElementById('clubCategory').value = club.category;
    document.getElementById('clubCategories').value = (club.categories || []).join(', ');
    document.getElementById('clubShortDesc').value = club.shortDesc || '';
    document.getElementById('clubLongDesc').value = club.longDesc || '';
    document.getElementById('clubFaculty').value = club.faculty || '';
    document.getElementById('clubContact').value = club.contact || '';
    document.getElementById('clubMembers').value = club.members || '';
    document.getElementById('clubOwner').value = club.owner || '';
    
    document.getElementById('clubLogoPath').value = club.logo || '';
    if (club.logo) {
        document.getElementById('logoPreviewContainer').innerHTML = `<img src="../${club.logo}" class="logo-preview">`;
    } else {
        document.getElementById('logoPreviewContainer').innerHTML = '';
    }

    const mediaList = club.media || [];
    document.getElementById('clubMediaPaths').value = mediaList.join(',');
    
    const mediaContainer = document.getElementById('mediaPreviewContainer');
    mediaContainer.innerHTML = '';
    mediaList.forEach(m => {
        mediaContainer.innerHTML += `<img src="../${m}" class="media-preview">`;
    });

    document.getElementById('deleteBtn').style.display = 'inline-block';
    document.getElementById('clubModalLabel').innerText = 'Edit Club';
    clubModal.show();
}

async function uploadLogo() {
    const fileInput = document.getElementById('logoUpload');
    if (fileInput.files.length === 0) return alert('Select a logo first');
    
    const formData = new FormData();
    formData.append('logo', fileInput.files[0]);
    
    try {
        const res = await fetch(`${API_URL}/upload/logo`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            document.getElementById('clubLogoPath').value = data.filePath;
            document.getElementById('logoPreviewContainer').innerHTML = `<img src="../${data.filePath}" class="logo-preview">`;
            showAlert('Logo uploaded successfully', 'success');
        }
    } catch(e) {
        showAlert('Upload failed', 'danger');
    }
}

async function uploadMedia() {
    const fileInput = document.getElementById('mediaUpload');
    if (fileInput.files.length === 0) return alert('Select media files first');
    
    const clubId = document.getElementById('clubId').value || 'new-club-' + Date.now();
    document.getElementById('clubId').value = clubId; // Make sure new clubs get an ID
    
    const formData = new FormData();
    formData.append('id', clubId);
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('media', fileInput.files[i]);
    }
    
    try {
        const res = await fetch(`${API_URL}/upload/media`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            let existing = document.getElementById('clubMediaPaths').value;
            let existingArr = existing ? existing.split(',') : [];
            let newArr = existingArr.concat(data.filePaths);
            document.getElementById('clubMediaPaths').value = newArr.join(',');
            
            const mediaContainer = document.getElementById('mediaPreviewContainer');
            data.filePaths.forEach(m => {
                mediaContainer.innerHTML += `<img src="../${m}" class="media-preview">`;
            });
            showAlert('Media uploaded successfully', 'success');
        }
    } catch(e) {
        showAlert('Upload failed', 'danger');
    }
}

async function saveClub() {
    const clubId = document.getElementById('clubId').value || document.getElementById('clubTitle').value.replace(/\s+/g, '-').toLowerCase();
    
    const clubObj = {
        id: clubId,
        title: document.getElementById('clubTitle').value,
        category: document.getElementById('clubCategory').value,
        categories: document.getElementById('clubCategories').value.split(',').map(s=>s.trim()).filter(s=>s),
        shortDesc: document.getElementById('clubShortDesc').value,
        longDesc: document.getElementById('clubLongDesc').value,
        faculty: document.getElementById('clubFaculty').value,
        contact: document.getElementById('clubContact').value,
        members: document.getElementById('clubMembers').value,
        owner: document.getElementById('clubOwner').value,
        logo: document.getElementById('clubLogoPath').value,
        media: document.getElementById('clubMediaPaths').value ? document.getElementById('clubMediaPaths').value.split(',') : []
    };

    const existingIndex = clubsData.findIndex(c => c.id === clubId);
    if (existingIndex >= 0) {
        clubsData[existingIndex] = clubObj;
    } else {
        clubsData.push(clubObj);
    }

    await saveToServer();
    clubModal.hide();
    renderTable();
}

async function deleteCurrentClub() {
    if(!confirm('Are you sure you want to delete this club?')) return;
    const clubId = document.getElementById('clubId').value;
    clubsData = clubsData.filter(c => c.id !== clubId);
    await saveToServer();
    clubModal.hide();
    renderTable();
}

async function saveToServer() {
    try {
        const res = await fetch(`${API_URL}/clubs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clubsData)
        });
        if(res.ok) showAlert('Clubs saved successfully!', 'success');
        else throw new Error('Failed');
    } catch(e) {
        showAlert('Failed to save to server', 'danger');
    }
}

function showAlert(msg, type) {
    const alertHtml = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    document.getElementById('alertContainer').innerHTML = alertHtml;
    setTimeout(() => {
        document.getElementById('alertContainer').innerHTML = '';
    }, 3000);
}

// Init
loadClubs();
