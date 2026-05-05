const fs = require('fs');

function fixSyntax(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

fixSyntax('src/components/Header.tsx');
fixSyntax('src/components/Sidebar.tsx');
console.log('Fixed syntax');
