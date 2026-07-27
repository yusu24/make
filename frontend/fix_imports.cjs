const fs = require('fs');
const path = require('path');
const dir = 'c:/Project/umkm/frontend/src/apps/kuliner/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('react-i18next')) {
    content = content.replace(/import\s+\{\s*useTranslation\s*\}\s+from\s+['"]react-i18next['"];?/g, 'import { useTranslation } from \'../../../contexts/I18nContext\';');
    fs.writeFileSync(filePath, content);
    console.log('Fixed: ' + f);
  }
});
