/* eslint-env browser */
/* global updateFlashcard, setFlashcardMessage */
// Flashcards and random card logic for webapps.html
const flashcardState = {
    items: [],
    index: 0,
    flipped: false,
    streak: 0,
    flippedCurrent: false
};

// `flashcardEls` e le funzioni di controllo (updateFlashcard, setFlashcardMessage)
// sono definite nell'altro script inline di questa pagina; qui non servono.

function parseCSV(text) {
    const rows = [];
    let current = '';
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
            if (char === ',') {
                row.push(current.trim());
                current = '';
                continue;
            }

            if (char === '\r' && next === '\n') {
                i++;
            }

            row.push(current.trim());
            if (row.length > 1 || row.some(cell => cell.length > 0)) {
                rows.push(row);
            }
            row = [];
            current = '';
            continue;
        }

        current += char;
    }

    if (current.length > 0 || row.length > 0) {
        row.push(current.trim());
        if (row.length > 1 || row.some(cell => cell.length > 0)) {
            rows.push(row);
        }
    }

    return rows;
}

function escapeHtml(s) {
    return (s + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initRandomFlashcard(rows) {
    const wrap = document.getElementById('randomFlashcardWrap');
    if (!wrap) return;

    const items = (rows || [])
        .filter(row => row.length >= 2)
        .map(row => ({
            q: row[0] || '—',
            a: row[1] || '—'
        }));

    if (items.length === 0) {
        wrap.innerHTML = '<div style="color:var(--text-secondary);">Nessuna flashcard disponibile.</div>';
        return;
    }

    let history = [];
    let historyIndex = -1;

    function pickRandom() {
        const idx = Math.floor(Math.random() * items.length);
        return items[idx];
    }

    function showCard(card) {
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

(function(){
    fetch('flashcard/flashcards_webapps.csv')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Impossibile caricare le flashcards.');
            }
            return response.text();
        })
        .then((text) => {
            const rows = parseCSV(text);
            flashcardState.items = rows
                .filter(row => row.length >= 2)
                .map(row => ({
                    front: row[0] || '—',
                    back: row[1] || '—'
                }));
            updateFlashcard();
            initRandomFlashcard(rows);
        })
        .catch(() => {
            setFlashcardMessage('Non riesco a caricare le flashcards. Verifica il file CSV.');
            flashcardState.items = [];
            updateFlashcard();
            initRandomFlashcard([]);
        });
})();
