const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const buttonRegex = /<button([^>]*)>([\s\S]*?)<span className="btn-text-mobile-hide">([^<]+)<\/span>([\s\S]*?)<\/button>/g;
    
    content = content.replace(buttonRegex, (match, p1, p2, p3, p4) => {
        if (p1.includes('title=')) {
            return match; // already has title
        }
        return `<button title="${p3.trim()}"${p1}>${p2}<span className="btn-text-mobile-hide">${p3}</span>${p4}</button>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.jsx')) {
            processFile(dirPath);
        }
    });
}

walkDir('c:/Project/umkm/frontend/src/apps/retail/pages');
console.log("Done.");
