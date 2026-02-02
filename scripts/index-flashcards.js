/* eslint-env browser */

(function(){
    // Carica e renderizza CSV delle flashcard (semplice parser che gestisce virgolette doppie)
    async function fetchCSV(path){
        const r = await fetch(path);
        if(!r.ok) throw new Error(r.status+' '+r.statusText);
        return r.text();
    }

    function parseCSV(text){
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
        const rows = [];
        for(const line of lines){
            const fields = [];
            let cur = '';
            let inQuotes = false;
            for(let i=0;i<line.length;i++){
                const ch = line[i];
                if(ch === '"'){
                    if(inQuotes && line[i+1] === '"'){
                        cur += '"'; i++; // escaped quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if(ch === ',' && !inQuotes){
                    fields.push(cur);
                    cur = '';
                } else {
                    cur += ch;
                }
            }
            fields.push(cur);
            rows.push(fields.map(f => f.replace(/^\s+|\s+$/g, '')));
        }
        return rows;
    }

    function renderGroup(title, sourcePath, cards, category){
        const container = document.getElementById('flashcardsContainer');
        const group = document.createElement('div');
        group.setAttribute('data-category', category);
        group.style.border = '1px solid rgba(15,23,42,0.06)';
        group.style.borderRadius = '12px';
        group.style.padding = '12px';
        group.style.background = 'rgba(255,255,255,0.6)';
        group.style.boxShadow = '0 4px 12px rgba(2,6,23,0.04)';

        group.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;">
                <div style="font-weight:700;color:var(--text-primary);">${escapeHtml(title)}</div>
                <div style="font-size:0.85rem;color:var(--text-secondary);">${escapeHtml(sourcePath)}</div>
            </div>
            <div class="fc-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;"></div>
        `;
        const grid = group.querySelector('.fc-grid');

        cards.forEach((row) => {
            const q = row[0] || '';
            const a = row[1] || '';
            const card = document.createElement('div');
            card.className = 'fc-card';
            card.setAttribute('data-q', q.toLowerCase());
            card.setAttribute('data-a', a.toLowerCase());
            card.style.background = 'var(--card-bg, #fff)';
            card.style.border = '1px solid rgba(15,23,42,0.06)';
            card.style.borderRadius = '10px';
            card.style.padding = '12px';
            card.style.boxShadow = '0 4px 12px rgba(2,6,23,0.04)';
            card.innerHTML = `
                <div style="font-weight:600;margin-bottom:8px;color:var(--text-primary);">${escapeHtml(q)}</div>
                <div class="fc-answer" style="display:none;color:var(--text-secondary);margin-bottom:10px;">${escapeHtml(a)}</div>
                <div style="display:flex;gap:8px;justify-content:flex-end;">
                    <button class="fc-toggle" style="background:#0369a1;color:#fff;border:0;padding:8px 10px;border-radius:8px;cursor:pointer">Mostra risposta</button>
                </div>
            `;
            grid.appendChild(card);
            const btn = card.querySelector('.fc-toggle');
            const ans = card.querySelector('.fc-answer');
            btn.addEventListener('click', ()=>{
                if(ans.style.display === 'none') { ans.style.display = 'block'; btn.textContent = 'Nascondi risposta'; }
                else { ans.style.display = 'none'; btn.textContent = 'Mostra risposta'; }
            });
        });

        container.appendChild(group);
    }

    function escapeHtml(s){
        return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function initRandomFlashcard(allCards){
        const wrap = document.getElementById('randomFlashcardWrap');
        if (!allCards || allCards.length === 0) {
            wrap.innerHTML = '<div style="color:var(--text-secondary);">Nessuna flashcard disponibile.</div>';
            return;
        }

        let history = [];
        let historyIndex = -1;

        function pickRandom(){
            const idx = Math.floor(Math.random() * allCards.length);
            return allCards[idx];
        }

        function showCard(card){
            wrap.innerHTML = '';

            const cardEl = document.createElement('div');
            cardEl.style.position = 'relative';
            cardEl.style.maxWidth = '640px';
            cardEl.style.width = '100%';
            cardEl.style.height = '100%';
            cardEl.style.display = 'flex';
            cardEl.style.flexDirection = 'column';
            cardEl.style.background = 'var(--card-bg, #fff)';
            cardEl.style.border = '1px solid rgba(15,23,42,0.06)';
            cardEl.style.borderRadius = '12px';
            cardEl.style.boxShadow = '0 8px 20px rgba(2,6,23,0.06)';
            cardEl.style.cursor = 'pointer';

            cardEl.innerHTML = `
                <div style="font-weight:700;margin-bottom:10px;color:var(--text-primary);">${escapeHtml(card.q)}</div>
                <div class="rf-answer" style="display:none;color:var(--text-secondary);margin-bottom:12px;">${escapeHtml(card.a)}</div>
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--text-secondary);">
                    <span>◀ Precedente</span>
                    <span>${escapeHtml(card.category || '')}</span>
                    <span>Successiva ▶</span>
                </div>
            `;

            const leftZone = document.createElement('div');
            const centerZone = document.createElement('div');
            const rightZone = document.createElement('div');
            leftZone.style.position = centerZone.style.position = rightZone.style.position = 'absolute';
            leftZone.style.top = centerZone.style.top = rightZone.style.top = '0';
            leftZone.style.bottom = centerZone.style.bottom = rightZone.style.bottom = '0';
            leftZone.style.left = '0';
            leftZone.style.width = '30%';
            centerZone.style.left = '30%';
            centerZone.style.width = '40%';
            rightZone.style.right = '0';
            rightZone.style.width = '30%';
            leftZone.style.background = centerZone.style.background = rightZone.style.background = 'transparent';

            const ans = cardEl.querySelector('.rf-answer');

            leftZone.addEventListener('click', (e) => {
                e.stopPropagation();
                if (historyIndex > 0) {
                    historyIndex--;
                    showCard(history[historyIndex]);
                }
            });

            rightZone.addEventListener('click', (e) => {
                e.stopPropagation();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    showCard(history[historyIndex]);
                } else {
                    const next = pickRandom();
                    history.push(next);
                    historyIndex = history.length - 1;
                    showCard(next);
                }
            });

            centerZone.addEventListener('click', (e) => {
                e.stopPropagation();
                if (ans.style.display === 'none') ans.style.display = 'flex';
                else ans.style.display = 'none';
            });

            cardEl.appendChild(leftZone);
            cardEl.appendChild(centerZone);
            cardEl.appendChild(rightZone);
            wrap.appendChild(cardEl);
        }

        const first = pickRandom();
        history.push(first);
        historyIndex = 0;
        showCard(first);
    }

    // init
    (async function(){
        const c = document.getElementById('flashcardsContainer');
        c.innerHTML = '';

        const sources = [
            { title: 'Cloud', path: 'flashcard/flashcards_cloud.csv', category: 'cloud' },
            { title: 'Containers', path: 'flashcard/flashcards_containers.csv', category: 'containers' },
            { title: 'OCI', path: 'flashcard/flashcards_oci.csv', category: 'oci' },
            { title: 'Webapps', path: 'flashcard/flashcards_webapps.csv', category: 'webapps' }
        ];

        try{
            const allCards = [];
            for (const src of sources) {
                const txt = await fetchCSV(src.path);
                const rows = parseCSV(txt);
                rows.forEach(r => {
                    allCards.push({
                        q: r[0] || '',
                        a: r[1] || '',
                        category: src.title
                    });
                });
                renderGroup(src.title, src.path, rows, src.category);
            }

            initRandomFlashcard(allCards);

            const searchInput = document.getElementById('flashcardSearch');
            const filterButtons = Array.from(document.querySelectorAll('.fc-filter'));
            let activeFilter = 'all';

            const applyFilters = () => {
                const term = (searchInput.value || '').toLowerCase().trim();
                const groups = Array.from(document.querySelectorAll('#flashcardsContainer > div[data-category]'));

                groups.forEach(group => {
                    const cat = group.getAttribute('data-category');
                    const cards = Array.from(group.querySelectorAll('.fc-card'));
                    let anyVisible = false;

                    cards.forEach(card => {
                        const q = card.getAttribute('data-q') || '';
                        const a = card.getAttribute('data-a') || '';
                        const matchText = !term || q.includes(term) || a.includes(term);
                        const matchCat = activeFilter === 'all' || cat === activeFilter;
                        const visible = matchText && matchCat;
                        card.style.display = visible ? 'block' : 'none';
                        if (visible) anyVisible = true;
                    });

                    group.style.display = anyVisible ? 'block' : 'none';
                });
            };

            searchInput.addEventListener('input', applyFilters);
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    activeFilter = btn.getAttribute('data-filter');
                    filterButtons.forEach(b => {
                        if (b === btn) {
                            b.style.background = '#0f172a';
                            b.style.color = '#fff';
                        } else {
                            b.style.background = '#e2e8f0';
                            b.style.color = '#0f172a';
                        }
                    });
                    applyFilters();
                });
            });

            applyFilters();
        }catch(err){
            c.innerHTML = '<div style="grid-column:1/-1;color:var(--text-secondary)">Errore caricamento flashcard: '+(err.message||err)+'</div>';
            console.error(err);
        }
    })();
})();
