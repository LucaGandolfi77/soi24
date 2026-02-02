/* eslint-env browser */
/* exported showGlossary, closeGlossary */

function showGlossary(term, definition) {
    document.getElementById('glossary-term').textContent = term;
    document.getElementById('glossary-definition').textContent = definition;
    document.getElementById('glossary-popup').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeGlossary() {
    document.getElementById('glossary-popup').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Esponi per chiamate da HTML
window.showGlossary = showGlossary;
window.closeGlossary = closeGlossary;

// Close on click outside
document.addEventListener('click', function(e) {
    const popup = document.getElementById('glossary-popup');
    if (e.target === popup) {
        closeGlossary();
    }
});

// Close on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGlossary();
    }
});

// Flashcards
const flashcardState = {
    items: [],
    index: 0,
    flipped: false,
    streak: 0,
    flippedCurrent: false
};

const flashcardEls = {
    card: document.getElementById('flashcard'),
    front: document.getElementById('flashcard-front'),
    back: document.getElementById('flashcard-back'),
    prev: document.getElementById('flashcard-prev'),
    next: document.getElementById('flashcard-next'),
    flip: document.getElementById('flashcard-flip'),
    shuffle: document.getElementById('flashcard-shuffle'),
    counter: document.getElementById('flashcard-counter'),
    streak: document.getElementById('flashcard-streak'),
    message: document.getElementById('flashcard-message')
};

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
            if (ans.style.display === 'none') {
                ans.style.display = 'block';
            } else {
                ans.style.display = 'none';
            }
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

function setFlashcardMessage(text) {
    if (!flashcardEls.message) return;
    if (!text) {
        flashcardEls.message.style.display = 'none';
        flashcardEls.message.textContent = '';
        return;
    }
    flashcardEls.message.style.display = 'block';
    flashcardEls.message.textContent = text;
}

function updateFlashcard() {
    const total = flashcardState.items.length;
    if (total === 0) {
        flashcardEls.front.textContent = 'Nessuna flashcard disponibile.';
        flashcardEls.back.textContent = '';
        flashcardEls.counter.textContent = '0 / 0';
        flashcardEls.card.classList.remove('is-flipped');
        flashcardState.flipped = false;
        flashcardState.flippedCurrent = false;
        flashcardState.streak = 0;
        if (flashcardEls.streak) {
            flashcardEls.streak.textContent = 'Streak: 0';
        }
        return;
    }

    const item = flashcardState.items[flashcardState.index];
    flashcardEls.front.textContent = item.front;
    flashcardEls.back.textContent = item.back;
    flashcardEls.counter.textContent = `${flashcardState.index + 1} / ${total}`;
    flashcardEls.card.classList.remove('is-flipped');
    flashcardState.flipped = false;
    flashcardState.flippedCurrent = false;
    if (flashcardEls.streak) {
        flashcardEls.streak.textContent = `Streak: ${flashcardState.streak}`;
    }
}

function flipFlashcard() {
    flashcardState.flipped = !flashcardState.flipped;
    flashcardEls.card.classList.toggle('is-flipped', flashcardState.flipped);
    if (flashcardState.flipped) {
        flashcardState.flippedCurrent = true;
    }
}

function goToFlashcard(step) {
    const total = flashcardState.items.length;
    if (total === 0) return;
    if (flashcardState.flippedCurrent) {
        flashcardState.streak += 1;
    } else {
        flashcardState.streak = 0;
    }
    flashcardState.index = (flashcardState.index + step + total) % total;
    updateFlashcard();
}

function shuffleFlashcards() {
    for (let i = flashcardState.items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcardState.items[i], flashcardState.items[j]] = [flashcardState.items[j], flashcardState.items[i]];
    }
    flashcardState.index = 0;
    flashcardState.streak = 0;
    updateFlashcard();
    setFlashcardMessage('Flashcards mescolate.');
    setTimeout(() => setFlashcardMessage(''), 1500);
}

if (flashcardEls.card) {
    flashcardEls.card.addEventListener('click', flipFlashcard);
    flashcardEls.flip.addEventListener('click', flipFlashcard);
    flashcardEls.prev.addEventListener('click', () => goToFlashcard(-1));
    flashcardEls.next.addEventListener('click', () => goToFlashcard(1));
    flashcardEls.shuffle.addEventListener('click', shuffleFlashcards);

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            return;
        }
        if (e.key === 'ArrowLeft') {
            goToFlashcard(-1);
        } else if (e.key === 'ArrowRight') {
            goToFlashcard(1);
        } else if (e.key === ' ' || e.key === 'Enter') {
            flipFlashcard();
        }
    });

    fetch('flashcard/flashcards_cloud.csv')
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
}
