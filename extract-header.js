const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPremium.tsx', 'utf-8');

// The content from line 529 to the next </div></div></div> etc that belongs to the header.
// Let's find the start of the <div className="flex items-center gap-[16px]"> which is the header content
const headerContentStart = content.indexOf('<div className="flex items-center gap-[16px]">');

let depth = 0;
let headerContentEnd = -1;
for (let i = headerContentStart; i < content.length; i++) {
  if (content.substr(i, 4) === '<div') depth++;
  if (content.substr(i, 5) === '</div') depth--;
  if (depth === 0 && headerContentStart !== -1 && i > headerContentStart + 10) {
    headerContentEnd = i + 6;
    break;
  }
}

const headerJSX = content.substring(headerContentStart, headerContentEnd);

fs.writeFileSync('headerJSX.txt', headerJSX);

// Replace empty <header></header> with nothing
content = content.replace(/<header className=\"h-\[72px\][\s\S]*?<\/header>/, '');
content = content.replace(headerJSX, '');

// Save DashboardPremium
fs.writeFileSync('src/pages/DashboardPremium.tsx', content);
console.log('Done extracting and cleaning');
