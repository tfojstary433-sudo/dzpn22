const https = require('https');

const url = 'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/match/status';

console.log('Testing URL:', url);

https.get(url, (res) => {
  console.log('StatusCode:', res.statusCode);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });

}).on('error', (e) => {
  console.error('Error:', e);
});
