const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/bayod/OneDrive/Desktop/Pastry/src');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('Sweet Delight')) {
        content = content.replace(/Sweet Delight/g, 'Sweet Delites');
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Total files updated: ${count}`);
