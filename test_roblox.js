
const https = require('https');

function checkUser(username) {
    const data = JSON.stringify({ usernames: [username], excludeBannedUsers: false });
    const options = {
        hostname: 'users.roblox.com',
        port: 443,
        path: '/v1/usernames/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => console.log(body));
    });

    req.on('error', (error) => console.error(error));
    req.write(data);
    req.end();
}

checkUser(process.argv[2]);
