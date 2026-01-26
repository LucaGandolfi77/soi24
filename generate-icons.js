const fs = require('fs');

function createPNG(size, filename) {
    // PNG header e chunks minimali
    const png = Buffer.alloc(8 + 25 + 12 + (size * size * 4 + size) + 12 + 12);
    let offset = 0;
    
    // PNG signature
    png.write('\x89PNG\r\n\x1a\n', offset);
    offset += 8;
    
    // IHDR chunk
    png.writeUInt32BE(13, offset); offset += 4;
    png.write('IHDR', offset); offset += 4;
    png.writeUInt32BE(size, offset); offset += 4;
    png.writeUInt32BE(size, offset); offset += 4;
    png.writeUInt8(8, offset++); // bit depth
    png.writeUInt8(6, offset++); // color type (RGBA)
    png.writeUInt8(0, offset++); // compression
    png.writeUInt8(0, offset++); // filter
    png.writeUInt8(0, offset++); // interlace
    
    // Creiamo un'immagine semplice con un gradiente blu
    const idat = Buffer.alloc(size * size * 4 + size);
    let idatOffset = 0;
    
    for (let y = 0; y < size; y++) {
        idat.writeUInt8(0, idatOffset++); // filter type
        for (let x = 0; x < size; x++) {
            const t = (x + y) / (size * 2);
            const r = Math.floor(74 + t * (102 - 74));
            const g = Math.floor(158 + t * (126 - 158));
            const b = Math.floor(255 + t * (234 - 255));
            
            // Disegna un rettangolo bianco al centro (documento)
            const inDoc = x > size * 0.3 && x < size * 0.7 && y > size * 0.25 && y < size * 0.75;
            
            if (inDoc) {
                idat.writeUInt8(255, idatOffset++); // R
                idat.writeUInt8(255, idatOffset++); // G
                idat.writeUInt8(255, idatOffset++); // B
                idat.writeUInt8(240, idatOffset++); // A
            } else {
                idat.writeUInt8(r, idatOffset++);
                idat.writeUInt8(g, idatOffset++);
                idat.writeUInt8(b, idatOffset++);
                idat.writeUInt8(255, idatOffset++);
            }
        }
    }
    
    // Comprimi IDAT usando zlib
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(idat);
    
    png.writeUInt32BE(compressed.length, offset); offset += 4;
    png.write('IDAT', offset); offset += 4;
    compressed.copy(png, offset);
    offset += compressed.length;
    
    // IEND chunk
    png.writeUInt32BE(0, offset); offset += 4;
    png.write('IEND', offset); offset += 4;
    
    fs.writeFileSync(filename, png.slice(0, offset));
    console.log(`Created ${filename}`);
}

createPNG(192, 'icon-192.png');
createPNG(512, 'icon-512.png');
