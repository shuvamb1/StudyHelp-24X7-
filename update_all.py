import os
import re

directory = 'c:/Users/shuva/OneDrive/Desktop/StudyHelp-24X7'

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()

        def remove_icons_from_btn(match):
            btn_html = match.group(0)
            btn_html = re.sub(r'<i class="[^"]*fa[^"]*"></i>\s*', '', btn_html)
            btn_html = re.sub(r'[\U00010000-\U0010ffff]', '', btn_html)
            return btn_html

        html = re.sub(r'<a [^>]*class="[^"]*btn[^"]*"[^>]*>.*?</a>', remove_icons_from_btn, html, flags=re.DOTALL)
        html = re.sub(r'<button [^>]*class="[^"]*btn[^"]*"[^>]*>.*?</button>', remove_icons_from_btn, html, flags=re.DOTALL)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Processed {filename}')

# CSS UPDATE
css_path = os.path.join(directory, 'css/styles.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Update mobile typography inside @media (max-width: 768px)
# We will just append p { font-size: 0.85rem; } and h2 { font-size: 2.1rem; }
# Let's replace the existing h2 in the mobile media query
css = re.sub(r'(h2\s*\{\s*font-size:\s*)1\.25rem', r'\g<1>2.1rem', css)

# Add p { font-size: 0.85rem; } right after h2
def inject_p(match):
    return match.group(0) + '\n  p { font-size: 0.85rem; }'

if 'p { font-size: 0.85rem; }' not in css:
    css = re.sub(r'h2\s*\{\s*font-size:\s*2\.1rem\s*;?\s*\}', inject_p, css, count=1)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('Updated styles.css')
