const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPremium.tsx', 'utf-8');
const lines = content.split('\n');

// Find the header start
const startLine = lines.findIndex(line => line.includes('<header className="h-[72px]'));
// Find the header end
const endLine = lines.findIndex((line, index) => index > startLine && line.includes('</header>'));

// The second </header> is the real one, let's find the last one before the content block
let lastHeaderEnd = -1;
for (let i = startLine + 1; i < lines.length; i++) {
  if (lines[i].includes('</header>')) {
    lastHeaderEnd = i;
  }
  if (lines[i].includes('Scroll principal do conteúdo')) {
    break;
  }
}

const headerLines = lines.slice(startLine, lastHeaderEnd + 1);
// Remove the broken empty </header>
const cleanHeaderLines = headerLines.filter(line => line.trim() !== '</header>' || headerLines.indexOf(line) === headerLines.length - 1);

fs.writeFileSync('headerJSX.txt', cleanHeaderLines.join('\n'));

// Remove from DashboardPremium
lines.splice(startLine, lastHeaderEnd - startLine + 1, '        <Header />');
fs.writeFileSync('src/pages/DashboardPremium.tsx', lines.join('\n'));
console.log('Extracted to headerJSX.txt');
