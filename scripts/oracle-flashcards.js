/* eslint-env browser */

(function(){
    // Simple CSV loader for flashcards (compatible with flashcards_oci.csv)
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
                    if(inQuotes && line[i+1] === '"') { cur += '"'; i++; }
                    else inQuotes = !inQuotes;
                } else if(ch === ',' && !inQuotes){
                    fields.push(cur);
                    cur = '';
                } else cur += ch;
            }
            fields.push(cur);
            rows.push(fields.map(f => f.replace(/^\s+|\s+$/g, '')));
        }
        return rows;
    }

    function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function render(cards){
        const container = document.getElementById('oracleFlashcards');
        container.innerHTML = '';
        cards.forEach((row) => {
            const q = row[0] || '';
            const a = row[1] || '';
            const card = document.createElement('div');
            card.style.background = 'var(--card-bg)';
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
            container.appendChild(card);
            const btn = card.querySelector('.fc-toggle');
            const ans = card.querySelector('.fc-answer');
            btn.addEventListener('click', ()=>{
                if(ans.style.display === 'none'){ ans.style.display = 'block'; btn.textContent = 'Nascondi risposta'; }
                else { ans.style.display = 'none'; btn.textContent = 'Mostra risposta'; }
            });
        });
    }

    function initRandomFlashcard(rows){
        const wrap = document.getElementById('randomFlashcardWrap');
        if (!wrap) return;

        const items = (rows || [])
            .filter(row => row.length >= 2)
            .map(row => ({ q: row[0] || '—', a: row[1] || '—' }));

        if (items.length === 0) {
            wrap.innerHTML = '<div style="color:var(--text-secondary);">Nessuna flashcard disponibile.</div>';
            return;
        }

        let history = [];
        let historyIndex = -1;

        function pickRandom(){
            const idx = Math.floor(Math.random() * items.length);
            return items[idx];
        }

        function showCard(card){
            wrap.innerHTML = '';
            const cardEl = document.createElement('div');
            cardEl.style.position = 'relative';
            cardEl.style.maxWidth = '640px';
            cardEl.style.width = '100%';
            cardEl.style.background = 'var(--card-bg, #fff)';
            cardEl.style.border = '1px solid rgba(15,23,42,0.06)';
            cardEl.style.borderRadius = '12px';
            cardEl.style.padding = '18px 16px';
            cardEl.style.boxShadow = '0 8px 20px rgba(2,6,23,0.06)';
            cardEl.style.cursor = 'pointer';

            cardEl.innerHTML = `
                <div style="font-weight:700;margin-bottom:10px;color:var(--text-primary);">${escapeHtml(card.q)}</div>
                <div class="rf-answer" style="display:none;color:var(--text-secondary);margin-bottom:12px;">${escapeHtml(card.a)}</div>
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--text-secondary);">
                    <span>◀ Precedente</span>
                    <span>Random</span>
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
                if (ans.style.display === 'none') { ans.style.display = 'block'; }
                else { ans.style.display = 'none'; }
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

    (async function(){
        try{
            const txt = await fetchCSV('flashcard/flashcards_oci.csv');
            const rows = parseCSV(txt);
            render(rows);
            initRandomFlashcard(rows);
        }catch(err){
            const c = document.getElementById('oracleFlashcards');
            c.innerHTML = '<div style="grid-column:1/-1;color:var(--text-secondary)">Errore caricamento flashcard: '+(err.message||err)+'</div>';
            const r = document.getElementById('randomFlashcardWrap');
            if (r) {
                r.innerHTML = '<div style="color:var(--text-secondary)">Errore caricamento flashcard: '+(err.message||err)+'</div>';
            }
            console.error(err);
        }
    })();
})();
