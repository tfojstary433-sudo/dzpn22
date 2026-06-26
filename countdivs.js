var fs = require('fs');
var c = fs.readFileSync('./src/app/turnieje/page.tsx', 'utf8');
var opens = (c.match(/<div/g) || []).length;
var closes = (c.match(/<\/div>/g) || []).length;
var selfclose = (c.match(/<div[^>]*\/>/g) || []).length;
console.log('Opens: ' + opens + ' Closes: ' + closes + ' Self-close: ' + selfclose);
console.log('Net unclosed: ' + (opens - closes - selfclose));
