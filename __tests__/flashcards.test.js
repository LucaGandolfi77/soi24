const { parseCSV } = require('../tools/flashcards');

test('parses simple CSV', () => {
  const txt = 'q1,a1\nq2,a2\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([['q1','a1'],['q2','a2']]);
});

test('handles quoted fields and commas', () => {
  const txt = '"a,1","b""2"\n"c","d"\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([['a,1','b"2'],['c','d']]);
});

test('ignores empty lines and trims', () => {
  const txt = '  q  ,  a  \n\n"x" , "y"\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([['q','a'],['x','y']]);
});

test('handles CRLF line endings', () => {
  const txt = 'q1,a1\r\nq2,a2\r\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([['q1','a1'],['q2','a2']]);
});

test('preserves spaces inside quoted fields', () => {
  const txt = '"  spaced  ",b\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([["  spaced  ",'b']]);
});

test('handles multiline quoted fields', () => {
  const txt = '"line1\nline2",answer\n';
  const rows = parseCSV(txt);
  expect(rows).toEqual([["line1\nline2",'answer']]);
});
