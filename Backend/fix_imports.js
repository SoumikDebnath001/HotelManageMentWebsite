const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./controllers', (filePath) => {
    if (!filePath.endsWith('.js')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find things like require("../../../Models/Hotel/hotel")
    // or require("../../Models/Hotel/amenityModel")
    // and replace with require("../../../Models/hotel")
    
    let changed = false;
    let newContent = content.replace(/require\(['"](\.\.\/)+Models\/([a-zA-Z0-9_]+\/)*([a-zA-Z0-9_]+)['"]\)/g, (match, p1, p2, p3) => {
        changed = true;
        return `require("../../../Models/${p3}")`;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
});
