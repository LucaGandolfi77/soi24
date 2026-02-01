// Lista dei PDF disponibili nella cartella /pdf
const availablePDFs = [
    { id: 1, name: 'SOI25-01-containers.pdf', path: '/pdf/SOI25-01-containers.pdf', title: 'Containers' },
    { id: 2, name: 'SOI25-02-webapps.pdf', path: '/pdf/SOI25-02-webapps.pdf', title: 'Web Apps' },
    { id: 3, name: 'SOI25-03-cloud.pdf', path: '/pdf/SOI25-03-cloud.pdf', title: 'Cloud' },
    { id: 4, name: 'SOI25-04-oracle.pdf', path: '/pdf/SOI25-04-oracle.pdf', title: 'Oracle' }
];

// Stato dell'applicazione
let appState = {
    sections: [],
    currentSectionId: null
};

// Caricamento dello stato dal localStorage
function loadState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        appState = JSON.parse(savedState);
    } else {
        // Inizializza le sezioni dai PDF disponibili
        initializeSectionsFromPDFs();
    }
    renderSections();
}

// Inizializza una sezione per ogni PDF
function initializeSectionsFromPDFs() {
    appState.sections = availablePDFs.map(pdf => ({
        id: pdf.id,
        title: pdf.title,
        description: pdf.name,
        pdfSource: pdf.path,
        content: [],
        createdAt: new Date().toISOString()
    }));
    saveState();
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

    // 'Aggiungi' button removed — content is now read-only previews and summaries
}

// Gestione sezioni
function renderSections() {
    const container = document.getElementById('sectionsContent');

    if (appState.sections.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">Nessuna sezione trovata</div>
                <div>Le sezioni verranno create automaticamente dai PDF disponibili</div>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.sections.map(section => {
        // Aggiungi link al riassunto per le sezioni che hanno una pagina dedicata
        let summaryLink = '';
        if (section.id === 1) {
            summaryLink = `<a href="containers.html" class="btn-icon" style="text-decoration: none;">📖 Vedi Riassunto</a>`;
        } else if (section.id === 2) {
            summaryLink = `<a href="webapps.html" class="btn-icon" style="text-decoration: none;">📖 Vedi Riassunto</a>`;
        } else if (section.id === 3) {
            summaryLink = `<a href="cloud.html" class="btn-icon" style="text-decoration: none;">📖 Vedi Riassunto</a>`;
        } else if (section.id === 4) {
            summaryLink = `<a href="oracle.html" class="btn-icon" style="text-decoration: none;">📖 Vedi Riassunto</a>`;
        }

        return `
        <div class="section-card" data-section-id="${section.id}">
            <div class="section-header">
                <div>
                    <h3 class="section-title">${section.title}</h3>
                    ${section.description ? `<p class="section-description">📄 ${section.description}</p>` : ''}
                </div>
                <div class="section-actions">
                    ${summaryLink}
                </div>
            </div>
            <div class="section-content">
                ${renderSectionContent(section)}
            </div>
        </div>
    `;
    }).join('');
}

function renderSectionContent(section) {
    const previewSnippets = {
        1: 'Containers — Cos\u2019\u00e8 un container: un pacchetto leggero che contiene applicazione + dipendenze. Le immagini sono costruite a livelli (layer) per riuso e caching; gli orchestratori (es. Kubernetes) gestiscono distribuzione, scalabilità e tolleranza ai guasti. Use case: microservizi, CI/CD, ambienti di test isolati.',
        2: 'Web Apps — Concetti chiave: separazione front-end/back-end; SPA (React/Vue) spostano rendering al client; le API REST/GraphQL forniscono dati; autenticazione sicura (JWT, sessioni) e caching migliorano performance. Best practice: validazione lato server, gestione degli errori e progressive enhancement.',
        3: 'Cloud — Modelli di servizio: IaaS (VM, controllo completo del SO), PaaS (piattaforma gestita per deployment rapido), SaaS (software pronto). Vantaggi: provisioning rapido, scalabilit\u00e0, resilienza e pagamento on-demand. Quando scegliere: IaaS per controllo, PaaS per sviluppo veloce, SaaS per soluzioni pronte.',
        4: 'Oracle OCI — Componenti principali: Compute (VM/BareMetal, shapes), Storage (Block/File/Object), Networking (VCN, Subnet, IGW/DRG), IAM (Compartments, Policies) e servizi di sicurezza (Vault, Cloud Guard, WAF). Raccomandazioni: principio del minimo privilegio, monitoraggio, backup e cifratura dei dati.'
    };

    if (section.content.length === 0) {
        const snippet = previewSnippets[section.id] || 'Breve preview non disponibile.';
        const link = section.id === 1 ? 'containers.html' : section.id === 2 ? 'webapps.html' : section.id === 3 ? 'cloud.html' : 'oracle.html';
        // use section-specific thumbnail SVGs (assets/). fallback to icon-192.png
        const thumbMap = {
            1: 'assets/thumb-containers.svg',
            2: 'assets/thumb-webapps.svg',
            3: 'assets/thumb-cloud.svg',
            4: 'assets/thumb-oracle.svg'
        };
        const thumbSrc = thumbMap[section.id] || 'icon-192.png';
        const thumb = `<img src="${thumbSrc}" alt="preview"/>`;
        return `
            <div class="empty-state">
                <div class="preview-thumb">${thumb}</div>
                <div class="empty-state-text">${snippet}</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">Clicca <a href="${link}">qui</a> per il riassunto completo.</div>
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
    
    if (contentType === 'text') {
        const text = document.getElementById('contentText').value.trim();
        if (!text) {
            alert('Inserisci del testo');
            return;
        }
        
        section.content.push({
            type: 'text',
            content: text,
            source: section.description,
            addedAt: new Date().toISOString()
        });
        
        saveState();
        renderSections();
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
                source: section.description,
                addedAt: new Date().toISOString()
            });
            saveState();
            renderSections();
        };
        reader.readAsDataURL(imageFile);
    }
    
    hideContentModal();
}

// Esporta funzioni globali necessarie
window.showAddContentModal = showAddContentModal;
window.removeContent = removeContent;
