/* eslint-env browser */
/* exported showGlossary, closeGlossary */

function showGlossary(term, definition){
    document.getElementById('glossary-term').textContent = term;
    document.getElementById('glossary-definition').textContent = definition;
    document.getElementById('glossary-popup').style.display = 'flex';
}
function closeGlossary(){ document.getElementById('glossary-popup').style.display = 'none'; }
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeGlossary(); });
document.addEventListener('click', function(e){ if(e.target.id === 'glossary-popup') closeGlossary(); });

// Esponi per chiamate da HTML
window.showGlossary = showGlossary;
window.closeGlossary = closeGlossary;
