const fs = require('fs');

const rawHtml = fs.readFileSync('kuliner_raw.html', 'utf8');

// Extract the body content
const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) {
    console.error("Could not find body tag");
    process.exit(1);
}

let jsxBody = bodyMatch[1];

// 1. Regex class=" -> className="
jsxBody = jsxBody.replace(/class="/g, 'className="');

// 2. Self closing tags
jsxBody = jsxBody.replace(/<img([^>]+)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.substring(0, match.length - 1) + ' />';
});
jsxBody = jsxBody.replace(/<input([^>]+)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.substring(0, match.length - 1) + ' />';
});
jsxBody = jsxBody.replace(/<path([^>]+)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.substring(0, match.length - 1) + ' />';
});
// Also fix viewBox
jsxBody = jsxBody.replace(/viewbox=/g, 'viewBox=');

// 3. Prefix tailwind custom classes
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
];

colorClasses.sort((a, b) => b.length - a.length);

colorClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp('\\\\bbg-' + c + '\\\\b', 'g'), 'bg-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\btext-' + c + '\\\\b', 'g'), 'text-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bborder-' + c + '\\\\b', 'g'), 'border-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bring-' + c + '\\\\b', 'g'), 'ring-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bshadow-' + c + '\\\\b', 'g'), 'shadow-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bfrom-' + c + '\\\\b', 'g'), 'from-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bto-' + c + '\\\\b', 'g'), 'to-kl-' + c);
});

const fontClasses = ['label-sm', 'headline-md', 'headline-lg', 'body-md', 'body-lg', 'display-lg', 'label-md'];
fontClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp('\\\\bfont-' + c + '\\\\b', 'g'), 'font-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\btext-' + c + '\\\\b', 'g'), 'text-kl-' + c);
});

const spaceClasses = ['sm', 'margin', 'md', 'xs', 'base', 'xl', 'lg', 'gutter'];
spaceClasses.forEach(c => {
    jsxBody = jsxBody.replace(new RegExp('\\\\bp-' + c + '\\\\b', 'g'), 'p-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bpy-' + c + '\\\\b', 'g'), 'py-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bpx-' + c + '\\\\b', 'g'), 'px-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bm-' + c + '\\\\b', 'g'), 'm-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bmy-' + c + '\\\\b', 'g'), 'my-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bmx-' + c + '\\\\b', 'g'), 'mx-kl-' + c);
    jsxBody = jsxBody.replace(new RegExp('\\\\bgap-' + c + '\\\\b', 'g'), 'gap-kl-' + c);
});

jsxBody = jsxBody.replace(/style="([^"]*)"/g, (match, styleString) => {
    let reactStyleObj = '{';
    const rules = styleString.split(';').filter(Boolean);
    rules.forEach(rule => {
        let [key, val] = rule.split(':');
        if (key && val) {
            key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            reactStyleObj += key + ': "' + val.trim().replace(/"/g, "'") + '", ';
        }
    });
    reactStyleObj += '}';
    return 'style={' + reactStyleObj + '}';
});

jsxBody = jsxBody.replace(/<!--(.*?)-->/g, "{/* $1 */}");

const componentStr = "import React from 'react';\\n" +
"import { Link } from 'react-router-dom';\\n\\n" +
"export default function Storefront() {\\n" +
"  return (\\n" +
"    <div className=\\"kuliner-landing bg-kl-background text-kl-on-surface font-kl-body-md\\">\\n" +
"      " + jsxBody + "\\n" +
"    </div>\\n" +
"  );\\n" +
"}\\n";

fs.writeFileSync('src/apps/kuliner/pages/Storefront.jsx', componentStr);

const tailwindConfigExtension = `
        kuliner: {
          colors: {
            'kl-on-surface-variant': '#584237',
            'kl-on-primary-fixed-variant': '#7a3000',
            'kl-outline': '#8c7166',
            'kl-error-container': '#ffdad6',
            'kl-surface-tint': '#a04100',
            'kl-on-surface': '#1e1b18',
            'kl-primary-container': '#f37021',
            'kl-on-background': '#1e1b18',
            'kl-on-primary': '#ffffff',
            'kl-surface-variant': '#e9e1dc',
            'kl-surface-container-lowest': '#ffffff',
            'kl-on-secondary-fixed-variant': '#005313',
            'kl-surface-container-high': '#efe6e2',
            'kl-background': '#fff8f5',
            'kl-on-tertiary-container': '#402c00',
            'kl-primary-fixed': '#ffdbcb',
            'kl-outline-variant': '#e0c0b2',
            'kl-on-primary-container': '#541f00',
            'kl-surface-container-highest': '#e9e1dc',
            'kl-secondary-fixed': '#94f990',
            'kl-tertiary': '#7c5800',
            'kl-secondary-fixed-dim': '#78dc77',
            'kl-inverse-on-surface': '#f8efea',
            'kl-on-error-container': '#93000a',
            'kl-inverse-primary': '#ffb693',
            'kl-on-primary-fixed': '#341000',
            'kl-tertiary-fixed': '#ffdea8',
            'kl-surface-bright': '#fff8f5',
            'kl-surface': '#fff8f5',
            'kl-secondary-container': '#91f78e',
            'kl-secondary': '#006e1c',
            'kl-on-secondary-fixed': '#002204',
            'kl-on-error': '#ffffff',
            'kl-primary': '#a04100',
            'kl-on-tertiary-fixed-variant': '#5e4200',
            'kl-surface-container-low': '#fbf2ed',
            'kl-inverse-surface': '#34302c',
            'kl-on-tertiary': '#ffffff',
            'kl-tertiary-fixed-dim': '#ffba20',
            'kl-error': '#ba1a1a',
            'kl-surface-dim': '#e1d8d4',
            'kl-on-secondary': '#ffffff',
            'kl-surface-container': '#f5ece7',
            'kl-primary-fixed-dim': '#ffb693',
            'kl-on-secondary-container': '#00731e',
            'kl-tertiary-container': '#c48d00',
            'kl-on-tertiary-fixed': '#271900'
          },
          spacing: {
            'kl-sm': '12px',
            'kl-margin': '32px',
            'kl-md': '24px',
            'kl-xs': '4px',
            'kl-base': '8px',
            'kl-xl': '64px',
            'kl-lg': '40px',
            'kl-gutter': '24px'
          },
          fontSize: {
            'kl-label-sm': ['12px', {lineHeight: '16px', fontWeight: '500'}],
            'kl-headline-md': ['24px', {lineHeight: '32px', fontWeight: '600'}],
            'kl-headline-lg': ['32px', {lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700'}],
            'kl-body-md': ['16px', {lineHeight: '24px', fontWeight: '400'}],
            'kl-body-lg': ['18px', {lineHeight: '28px', fontWeight: '400'}],
            'kl-display-lg': ['48px', {lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700'}],
            'kl-label-md': ['14px', {lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600'}]
          },
          fontFamily: {
            'kl-label-sm': ['Inter'],
            'kl-headline-md': ['Plus Jakarta Sans'],
            'kl-headline-lg': ['Plus Jakarta Sans'],
            'kl-body-md': ['Plus Jakarta Sans'],
            'kl-body-lg': ['Plus Jakarta Sans'],
            'kl-display-lg': ['Plus Jakarta Sans'],
            'kl-label-md': ['Inter']
          }
        }
`;

fs.writeFileSync('tailwind-kuliner-config.txt', tailwindConfigExtension);
console.log("Successfully parsed HTML and wrote files.");
