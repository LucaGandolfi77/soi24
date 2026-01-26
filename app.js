// Stato dell'applicazione
let appState = {
    pdfs: [],
    sections: [],
    currentSectionId: null
};

// Caricamento dello stato dal localStorage
function loadState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        appState = JSON.parse(savedState);
        renderPDFs();
        renderSections();
    }
}

// Salvataggio dello stato nel localStorage
function saveState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', () => {
    // Registra Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrato con successo:', registration);
            })
            .catch(error => {
                console.log('Registrazione Service Worker fallita:', error);
            });
    }

    // Gestione installazione PWA
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Utente ha ${outcome === 'accepted' ? 'accettato' : 'rifiutato'} l'installazione`);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });

    // Carica stato salvato
    loadState();

    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Upload PDF
    const pdfInput = document.getElementById('pdfInput');
    const uploadArea = document.getElementById('uploadArea');

    pdfInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // Aggiungi sezione
    document.getElementById('addSectionBtn').addEventListener('click', () => {
        showSectionModal();
    });

    // Modal sezione
    document.getElementById('closeSectionModal').addEventListener('click', () => {
        hideSectionModal();
    });

    document.getElementById('cancelSectionBtn').addEventListener('click', () => {
        hideSectionModal();
    });

    document.getElementById('createSectionBtn').addEventListener('click', () => {
        createSection();
    });

    // Modal contenuto
    document.getElementById('closeModal').addEventListener('click', () => {
        hideContentModal();
    });

    document.getElementById('cancelContentBtn').addEventListener('click', () => {
        hideContentModal();
    });

    document.getElementById('contentType').addEventListener('change', (e) => {
        toggleContentType(e.target.value);
    });

    document.getElementById('imageInput').addEventListener('change', (e) => {
        previewImage(e.target.files[0]);
    });

    document.getElementById('addContentBtn').addEventListener('click', () => {
        addContentToSection();
    });
}

// Gestione file PDF
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    files.forEach(file => {
        if (file.type === 'application/pdf') {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: formatFileSize(file.size),
                date: new Date().toISOString()
            };
            
            // Salva il file in IndexedDB o come base64 (semplificato qui)
            const reader = new FileReader();
            reader.onload = (e) => {
                fileData.data = e.target.result;
                appState.pdfs.push(fileData);
                saveState();
                renderPDFs();
            };
            reader.readAsDataURL(file);
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function renderPDFs() {
    const container = document.getElementById('uploadedFiles');
    
    if (appState.pdfs.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = appState.pdfs.map(pdf => `
        <div class="file-item">
            <div class="file-info">
                <div>
                    <div class="file-name">📄 ${pdf.name}</div>
                    <div class="file-size">${pdf.size}</div>
                </div>
            </div>
            <button class="btn-delete" onclick="deletePDF('${pdf.id}')">🗑️</button>
        </div>
    `).join('');
}

function deletePDF(id) {
    if (confirm('Sei sicuro di voler eliminare questo PDF?')) {
        appState.pdfs = appState.pdfs.filter(pdf => pdf.id !== parseFloat(id));
        saveState();
        renderPDFs();
    }
}

// Gestione sezioni
function showSectionModal() {
    document.getElementById('sectionModal').classList.add('show');
    document.getElementById('sectionTitle').value = '';
    document.getElementById('sectionDescription').value = '';
}

function hideSectionModal() {
    document.getElementById('sectionModal').classList.remove('show');
}

function createSection() {
    const title = document.getElementById('sectionTitle').value.trim();
    const description = document.getElementById('sectionDescription').value.trim();

    if (!title) {
        alert('Inserisci un titolo per la sezione');
        return;
    }

    const section = {
        id: Date.now(),
        title,
        description,
        content: [],
        createdAt: new Date().toISOString()
    };

    appState.sections.push(section);
    saveState();
    renderSections();
    hideSectionModal();
}

function renderSections() {
    const container = document.getElementById('sectionsContent');

    if (appState.sections.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">Nessuna sezione ancora</div>
                <div>Clicca su "Aggiungi Sezione" per iniziare</div>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.sections.map(section => `
        <div class="section-card" data-section-id="${section.id}">
            <div class="section-header">
                <div>
                    <h3 class="section-title">${section.title}</h3>
                    ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
                </div>
                <div class="section-actions">
                    <button class="btn-icon" onclick="showAddContentModal(${section.id})">
                        ➕ Aggiungi Contenuto
                    </button>
                    <button class="btn-icon" onclick="deleteSection(${section.id})">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="section-content">
                ${renderSectionContent(section)}
            </div>
        </div>
    `).join('');
}

function renderSectionContent(section) {
    if (section.content.length === 0) {
        return `
            <div class="empty-state">
                <div>Nessun contenuto ancora</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">
                    Aggiungi testo o immagini dai tuoi PDF
                </div>
            </div>
        `;
    }

    return section.content.map((item, index) => {
        if (item.type === 'text') {
            return `
                <div class="content-item">
                    <button class="btn-remove-content" onclick="removeContent(${section.id}, ${index})">✕</button>
                    <div class="content-item-text">${item.content}</div>
                    <div class="content-source">📄 Fonte: ${item.source}</div>
                </div>
            `;
        } else if (item.type === 'image') {
            return `
                <div class="content-item">
                    <button class="btn-remove-content" onclick="removeContent(${section.id}, ${index})">✕</button>
                    <img src="${item.content}" alt="Immagine da PDF" class="content-item-image">
                    <div class="content-source">🖼️ Fonte: ${item.source}</div>
                </div>
            `;
        }
    }).join('');
}

function deleteSection(id) {
    if (confirm('Sei sicuro di voler eliminare questa sezione e tutto il suo contenuto?')) {
        appState.sections = appState.sections.filter(section => section.id !== id);
        saveState();
        renderSections();
    }
}

function removeContent(sectionId, contentIndex) {
    const section = appState.sections.find(s => s.id === sectionId);
    if (section) {
        section.content.splice(contentIndex, 1);
        saveState();
        renderSections();
    }
}

// Modal contenuto
function showAddContentModal(sectionId) {
    appState.currentSectionId = sectionId;
    
    // Popola select PDF
    const pdfSelect = document.getElementById('pdfSource');
    pdfSelect.innerHTML = '<option value="">Seleziona PDF...</option>' + 
        appState.pdfs.map(pdf => `<option value="${pdf.id}">${pdf.name}</option>`).join('');

    document.getElementById('contentModal').classList.add('show');
    document.getElementById('contentText').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

function hideContentModal() {
    document.getElementById('contentModal').classList.remove('show');
    appState.currentSectionId = null;
}

function toggleContentType(type) {
    const textGroup = document.getElementById('textGroup');
    const imageGroup = document.getElementById('imageGroup');
    
    if (type === 'text') {
        textGroup.style.display = 'block';
        imageGroup.style.display = 'none';
    } else {
        textGroup.style.display = 'none';
        imageGroup.style.display = 'block';
    }
}

function previewImage(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = 
                `<img src="${e.target.result}" alt="Anteprima">`;
        };
        reader.readAsDataURL(file);
    }
}

function addContentToSection() {
    const section = appState.sections.find(s => s.id === appState.currentSectionId);
    if (!section) return;

    const contentType = document.getElementById('contentType').value;
    const pdfSourceId = document.getElementById('pdfSource').value;
    
    if (!pdfSourceId) {
        alert('Seleziona un PDF sorgente');
        return;
    }

    const pdf = appState.pdfs.find(p => p.id == pdfSourceId);
    
    if (contentType === 'text') {
        const text = document.getElementById('contentText').value.trim();
        if (!text) {
            alert('Inserisci del testo');
            return;
        }
        
        section.content.push({
            type: 'text',
            content: text,
            source: pdf.name,
            addedAt: new Date().toISOString()
        });
    } else {
        const imageFile = document.getElementById('imageInput').files[0];
        if (!imageFile) {
            alert('Seleziona un\'immagine');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            section.content.push({
                type: 'image',
                content: e.target.result,
                source: pdf.name,
                addedAt: new Date().toISOString()
            });
            saveState();
            renderSections();
        };
        reader.readAsDataURL(imageFile);
    }

    if (contentType === 'text') {
        saveState();
        renderSections();
    }
    
    hideContentModal();
}

// Esporta funzioni globali necessarie
window.deletePDF = deletePDF;
window.deleteSection = deleteSection;
window.showAddContentModal = showAddContentModal;
window.removeContent = removeContent;
