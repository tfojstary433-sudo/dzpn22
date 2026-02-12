const fs = require('fs');
const path = require('path');

const OLD_LOGO = 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png';
const NEW_LOGO = 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png';

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(OLD_LOGO)) {
                console.log('Updating:', fullPath);
                content = content.split(OLD_LOGO).join(NEW_LOGO);
                fs.writeFileSync(fullPath, content);
            }
        }
    });
}

walk('.');
