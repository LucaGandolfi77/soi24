// Parser CSV leggero usato dalle pagine flashcard
function parseCSV(text){
  if(!text) return [];
  // remove BOM
  if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  let cellQuoted = false;
  let skipTrailing = false;

  for(let i=0;i<text.length;i++){
    const ch = text[i];
    const next = text[i+1];

    if(skipTrailing){
      if(ch === ' ' || ch === '\t') { continue; }
      // if not whitespace, clear skipTrailing and continue processing
      skipTrailing = false;
    }

    if(ch === '"'){
      // start of quoted cell (if at cell start or only whitespace seen before it)
      if(!inQuotes && cur.trim() === ''){
        inQuotes = true;
        cellQuoted = true;
        cur = '';
        continue;
      }
      if(inQuotes && next === '"'){
        // escaped quote
        cur += '"'; i++; continue;
      }
      if(inQuotes){
        // closing quote
        inQuotes = false;
        skipTrailing = true;
        continue;
      }
      // stray quote in unquoted field -> treat as char
      cur += ch; continue;
    }

    if(!inQuotes && (ch === ',' || ch === '\n' || ch === '\r')){
      if(ch === ','){
        row.push(cellQuoted ? cur : cur.trim());
        cur = '';
        cellQuoted = false;
        continue;
      }
      if(ch === '\r' && next === '\n'){ i++; }
      row.push(cellQuoted ? cur : cur.trim());
      if(row.length > 1 || row.some(c=>c.length>0)) rows.push(row);
      row = [];
      cur = '';
      cellQuoted = false;
      continue;
    }

    // normal character (including newlines when inside quotes)
    cur += ch;
  }

  if(cur.length > 0 || row.length > 0){
    row.push(cellQuoted ? cur : cur.trim());
    if(row.length > 1 || row.some(c=>c.length>0)) rows.push(row);
  }

  return rows;
}

module.exports = { parseCSV };
