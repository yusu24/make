import re

with open('kuliner_raw.html', 'r', encoding='utf-8') as f:
    raw_html = f.read()

body_match = re.search(r'<body[^>]*>([\s\S]*?)</body>', raw_html, re.IGNORECASE)
if not body_match:
    print("Could not find body tag")
    exit(1)

jsx_body = body_match.group(1)

# 1. Regex class=" -> className="
jsx_body = jsx_body.replace('class="', 'className="')

# 2. Self closing tags
jsx_body = re.sub(r'<img([^>]+)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<img{m.group(1)} />', jsx_body)
jsx_body = re.sub(r'<input([^>]+)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<input{m.group(1)} />', jsx_body)
jsx_body = re.sub(r'<path([^>]+)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<path{m.group(1)} />', jsx_body)

# Also fix viewBox
jsx_body = jsx_body.replace('viewbox=', 'viewBox=')

# 3. Prefix tailwind custom classes
color_classes = [
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
]

color_classes.sort(key=len, reverse=True)

for c in color_classes:
    jsx_body = re.sub(r'\bbg-' + c + r'\b', f'bg-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\btext-' + c + r'\b', f'text-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bborder-' + c + r'\b', f'border-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bring-' + c + r'\b', f'ring-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bshadow-' + c + r'\b', f'shadow-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bfrom-' + c + r'\b', f'from-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bto-' + c + r'\b', f'to-kl-{c}', jsx_body)

font_classes = ['label-sm', 'headline-md', 'headline-lg', 'body-md', 'body-lg', 'display-lg', 'label-md']
for c in font_classes:
    jsx_body = re.sub(r'\bfont-' + c + r'\b', f'font-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\btext-' + c + r'\b', f'text-kl-{c}', jsx_body)

space_classes = ['sm', 'margin', 'md', 'xs', 'base', 'xl', 'lg', 'gutter']
for c in space_classes:
    jsx_body = re.sub(r'\bp-' + c + r'\b', f'p-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bpy-' + c + r'\b', f'py-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bpx-' + c + r'\b', f'px-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bm-' + c + r'\b', f'm-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bmy-' + c + r'\b', f'my-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bmx-' + c + r'\b', f'mx-kl-{c}', jsx_body)
    jsx_body = re.sub(r'\bgap-' + c + r'\b', f'gap-kl-{c}', jsx_body)

def style_replacer(match):
    style_string = match.group(1)
    rules = [r.strip() for r in style_string.split(';') if r.strip()]
    react_style = '{'
    for rule in rules:
        if ':' in rule:
            key, val = rule.split(':', 1)
            key = key.strip()
            val = val.strip().replace('"', "'")
            # camelCase
            parts = key.split('-')
            key_camel = parts[0] + ''.join(p.capitalize() for p in parts[1:])
            react_style += f'{key_camel}: "{val}", '
    react_style += '}'
    return f'style={{{react_style}}}'

jsx_body = re.sub(r'style="([^"]*)"', style_replacer, jsx_body)

jsx_body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx_body)

component_str = f"""import React from 'react';
import {{ Link }} from 'react-router-dom';

export default function Storefront() {{
  return (
    <div className="kuliner-landing bg-kl-background text-kl-on-surface font-kl-body-md">
      {jsx_body}
    </div>
  );
}}
"""

with open('src/apps/kuliner/pages/Storefront.jsx', 'w', encoding='utf-8') as f:
    f.write(component_str)

print("Successfully generated Storefront.jsx")
