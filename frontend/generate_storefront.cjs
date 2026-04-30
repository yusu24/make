const fs = require('fs');
const path = require('path');

const rawHtml = fs.readFileSync('kuliner_raw.html', 'utf8');

const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) {
    console.error("Could not find body tag");
    process.exit(1);
}

let jsxBody = bodyMatch[1];

// Conversions
jsxBody = jsxBody.replace(/class="/g, 'className="');
jsxBody = jsxBody.replace(/<img([^>]+)>/g, (m, g1) => `<img${g1} />`);
jsxBody = jsxBody.replace(/<input([^>]+)>/g, (m, g1) => `<input${g1} />`);
jsxBody = jsxBody.replace(/<path([^>]+)>/g, (m, g1) => `<path${g1} />`);
jsxBody = jsxBody.replace(/viewbox=/g, 'viewBox=');
jsxBody = jsxBody.replace(/<!--(.*?)-->/g, "{/* $1 */}");

// Prefixing classes
const prefixClasses = (content) => {
    const colorClasses = [
        'on-surface-variant', 'on-primary-fixed-variant', 'outline', 'error-container',
        'surface-tint', 'on-surface', 'primary-container', 'on-background', 'on-primary',
        'surface-variant', 'surface-container-lowest', 'on-secondary-fixed-variant',
        'surface-container-high', 'background', 'on-tertiary-container', 'primary-fixed',
        'outline-variant', 'on-primary-container', 'surface-container-highest',
        'secondary-fixed', 'tertiary', 'secondary-fixed-dim', 'inverse-on-surface',
        'on-error-container', 'inverse-primary', 'on-primary-fixed', 'tertiary-fixed',
        'surface-bright', 'surface', 'secondary-container', 'secondary',
        'on-secondary-fixed', 'on-error', 'primary', 'on-tertiary-fixed-variant',
        'surface-container-low', 'inverse-surface', 'on-tertiary', 'tertiary-fixed-dim',
        'error', 'surface-dim', 'on-secondary', 'surface-container', 'primary-fixed-dim',
        'on-secondary-container', 'tertiary-container', 'on-tertiary-fixed'
    ].sort((a, b) => b.length - a.length);

    colorClasses.forEach(c => {
        const regex = new RegExp(`\\b(bg|text|border|ring|shadow|from|to)-${c}\\b`, 'g');
        content = content.replace(regex, `$1-kl-${c}`);
    });

    const spaceClasses = ['sm', 'margin', 'md', 'xs', 'base', 'xl', 'lg', 'gutter'];
    spaceClasses.forEach(c => {
        const regex = new RegExp(`\\b(p|py|px|m|my|mx|gap)-${c}\\b`, 'g');
        content = content.replace(regex, `$1-kl-${c}`);
    });

    return content;
};

jsxBody = prefixClasses(jsxBody);

// Style attribute conversion
jsxBody = jsxBody.replace(/style="([^"]*)"/g, (match, styleString) => {
    const rules = styleString.split(';').filter(Boolean);
    const reactRules = rules.map(rule => {
        const [key, val] = rule.split(':');
        const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return `${camelKey}: "${val.trim().replace(/"/g, "'")}"`;
    }).join(', ');
    return `style={{ ${reactRules} }}`;
});

const componentContent = `import React from 'react';

export default function Storefront() {
  return (
    <div className="kuliner-landing bg-kl-background text-kl-on-surface">
      ${jsxBody}
    </div>
  );
}
`;

fs.writeFileSync('src/apps/kuliner/pages/Storefront.jsx', componentContent);
console.log("Storefront.jsx generated successfully.");
