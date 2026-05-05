const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('Premium.tsx') || f === 'EsbocoPregacao.tsx');

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add BarChart2 to lucide-react imports if not there
  if (content.includes('lucide-react') && !content.includes('BarChart2')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/, (match, p1) => {
      return `import { ${p1.trim()}, BarChart2 } from 'lucide-react'`;
    });
  }

  // Insert Relatórios item into menuItems
  const menuItemsRegex = /(const menuItems = \[[\s\S]*?)(\s*\];?)/;
  if (menuItemsRegex.test(content)) {
    if (!content.includes("{ name: 'Relatórios'")) {
      content = content.replace(menuItemsRegex, (match, p1, p2) => {
        // Check if there is a trailing comma in the last item
        let newItems = p1;
        if (!newItems.trim().endsWith(',')) {
          newItems += ',';
        }
        return `${newItems}\n    { name: 'Relatórios', icon: BarChart2, active: false, path: '/relatorios' }${p2}`;
      });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
