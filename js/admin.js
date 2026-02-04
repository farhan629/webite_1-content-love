const DEFAULT_PASSWORD = "love";
const STORAGE_KEY = 'romanticSiteData';

let uploadedPhotos = [];
let giftNotes = [];
let backgroundMusic = "";

function checkLogin() {
    const pwd = document.getElementById('adminPassword').value;
    if (pwd === DEFAULT_PASSWORD) {
        document.getElementById('loginOverlay').style.display = 'none';
        loadSettings();
    } else {
        alert("Incorrect password! Hint: The password is 'love'");
    }
}

function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert("The file is too large! Please choose a file smaller than 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            backgroundMusic = e.target.result;
            document.getElementById('audioStatus').innerText = "Music Uploaded: " + file.name;
            document.getElementById('audioStatus').style.color = "#4CAF50";
        };
        reader.readAsDataURL(file);
    }
}

function addNote() {
    const input = document.getElementById('newNote');
    const note = input.value.trim();
    if (note) {
        giftNotes.push(note);
        input.value = '';
        renderNotes();
    }
}

function removeNote(index) {
    giftNotes.splice(index, 1);
    renderNotes();
}

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    giftNotes.forEach((note, index) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '10px 20px';
        item.style.background = '#fcfcfc';
        item.style.borderRadius = '10px';
        item.style.border = '1px solid #eee';
        item.innerHTML = `
            <span style="color: #333;">${note}</span>
            <button onclick="removeNote(${index})" style="background: none; border: none; color: #ff758c; cursor: pointer; font-size: 20px;">&times;</button>
        `;
        list.appendChild(item);
    });
}

// Utility: Compress Image
async function compressImage(base64Str, maxWidth = 800, quality = 0.5) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to JPEG with specified quality
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
    });
}

// Utility: Update Storage Meter
function updateStorageMeter() {
    const dataStr = JSON.stringify(localStorage);
    const sizeInBytes = new Blob([dataStr]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const percentage = Math.min((sizeInBytes / (5 * 1024 * 1024)) * 100, 100);

    const bar = document.getElementById('storageBar');
    const text = document.getElementById('storageText');
    
    if (bar && text) {
        bar.style.width = percentage + '%';
        text.innerText = `${sizeInMB} / 5 MB`;
        
        if (percentage > 90) bar.style.background = "#ff4d4d";
        else if (percentage > 70) bar.style.background = "#ffa500";
        else bar.style.background = "#ff758c";
    }
}

function handlePhotoUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('photoPreview');
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const originalBase64 = e.target.result;
            
            // Auto-compress for performance and hosting reliability
            const compressedBase64 = await compressImage(originalBase64);
            uploadedPhotos.push(compressedBase64);
            
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';

            const img = document.createElement('img');
            img.src = compressedBase64;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '15px';
            img.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            img.style.border = '3px solid white';
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '-5px';
            removeBtn.style.right = '-5px';
            removeBtn.style.background = '#ff758c';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '24px';
            removeBtn.style.height = '24px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = () => {
                const idx = uploadedPhotos.indexOf(compressedBase64);
                if (idx > -1) uploadedPhotos.splice(idx, 1);
                imgContainer.remove();
                updateStorageMeter();
            };

            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            preview.appendChild(imgContainer);
            updateStorageMeter();
        };
        reader.readAsDataURL(file);
    });
}

function loadSettings() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        yesText: "☁️ YES",
        noText: "☁️ NO",
        letter: "You make my world so much brighter. I'm the luckiest person to have you.",
        finalQuestion: "Will you be my rest of the half?",
        finalYesText: "YES!",
        finalNoText: "NO",
        thankYou: "Thank you for your time!",
        photos: [],
        notes: [],
        music: ""
    };

    document.getElementById('yesText').value = data.yesText || "☁️ YES";
    document.getElementById('noText').value = data.noText || "☁️ NO";
    document.getElementById('letterContent').value = data.letter || "";
    document.getElementById('finalQuestion').value = data.finalQuestion || "";
    document.getElementById('finalYesText').value = data.finalYesText || "";
    document.getElementById('finalNoText').value = data.finalNoText || "";
    document.getElementById('thankYouText').value = data.thankYou || "";
    
    // Load music status
    backgroundMusic = data.music || "";
    if (backgroundMusic) {
        document.getElementById('audioStatus').innerText = "Music is already set! ❤️";
        document.getElementById('audioStatus').style.color = "#4CAF50";
    }

    // Load notes
    giftNotes = data.notes || [];
    renderNotes();
    
    // Load photos into preview
    uploadedPhotos = data.photos || [];
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    uploadedPhotos.forEach(src => {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';

        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '15px';
        img.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        img.style.border = '3px solid white';

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '-5px';
        removeBtn.style.right = '-5px';
        removeBtn.style.background = '#ff758c';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '24px';
        removeBtn.style.height = '24px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = () => {
            const idx = uploadedPhotos.indexOf(src);
            if (idx > -1) uploadedPhotos.splice(idx, 1);
            imgContainer.remove();
            updateStorageMeter();
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        preview.appendChild(imgContainer);
    });

    updateStorageMeter();
}

function saveData() {
    const data = {
        yesText: document.getElementById('yesText').value,
        noText: document.getElementById('noText').value,
        letter: document.getElementById('letterContent').value,
        finalQuestion: document.getElementById('finalQuestion').value,
        finalYesText: document.getElementById('finalYesText').value,
        finalNoText: document.getElementById('finalNoText').value,
        thankYou: document.getElementById('thankYouText').value,
        photos: uploadedPhotos,
        notes: giftNotes,
        music: backgroundMusic
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        const status = document.getElementById('status');
        status.innerText = "All changes saved successfully!";
        status.style.color = "#4CAF50";
        updateStorageMeter();
        setTimeout(() => status.innerText = "", 3000);
    } catch (e) {
        console.error(e);
        alert("🚨 Storage Limit Exceeded! \n\nPlease remove some photos or use a smaller music file. Browsers only allow 5MB of local data.");
    }
}
function generateGitHubConfig() {
    const data = {
        yesText: document.getElementById('yesText').value,
        noText: document.getElementById('noText').value,
        letter: document.getElementById('letterContent').value,
        finalQuestion: document.getElementById('finalQuestion').value,
        finalYesText: document.getElementById('finalYesText').value,
        finalNoText: document.getElementById('finalNoText').value,
        thankYou: document.getElementById('thankYouText').value,
        photos: uploadedPhotos,
        notes: giftNotes,
        music: backgroundMusic
    };

    const configCode = `window.CONFIG = ${JSON.stringify(data, null, 4)};`;
    const area = document.getElementById('configExportArea');
    const output = document.getElementById('configOutput');
    
    area.style.display = 'block';
    output.value = configCode;
    area.scrollIntoView({ behavior: 'smooth' });
}

function copyConfigToClipboard() {
    const output = document.getElementById('configOutput');
    output.select();
    document.execCommand('copy');
    alert("Config code copied! Now paste it into js/config.js on GitHub. 🚀");
}
