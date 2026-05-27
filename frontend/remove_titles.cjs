const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/yusuf/.gemini/antigravity/scratch/umkm/frontend/src/apps/budidaya/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace single line h1 or h2 with className aq-page-title or page-title
  content = content.replace(/\s*<h[12] className="(aq-)?page-title"[^>]*>.*?<\/h[12]>/g, '');
  
  // Dashboard multi-line case
  if (file === 'Dashboard.jsx') {
    content = content.replace(/\s*<h1 className="aq-page-title">[\s\S]*?<\/h1>/, '');
  }

  // CycleDetail multi-line or inline styling case might be matched by the first regex, but let's be safe.
  content = content.replace(/\s*<h1 className="aq-page-title"[^>]*>[\s\S]*?<\/h1>/g, '');
  
  fs.writeFileSync(filePath, content);
});
console.log('Done!');
