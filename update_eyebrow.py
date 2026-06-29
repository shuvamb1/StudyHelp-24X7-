import re
import os

html_path = 'c:/Users/shuva/OneDrive/Desktop/StudyHelp-24X7/index.html'
css_path = 'c:/Users/shuva/OneDrive/Desktop/StudyHelp-24X7/css/styles.css'

# --- 1. Update HTML ---
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the old ticker-wrap
content = re.sub(r'<div class="ticker-wrap">.*?</div>\s*</div>\s*', '', content, flags=re.DOTALL)

# Function to add eyebrow
def add_eyebrow(html, search_str, eyebrow_text, center=False):
    style = ' style="justify-content: center; display: flex;"' if center else ''
    # Only replace if not already replaced to avoid duplicates on re-run
    if f'<span class="eyebrow-ticker"{style}>{eyebrow_text}</span>' not in html:
        return html.replace(search_str, f'<span class="eyebrow-ticker"{style}>{eyebrow_text}</span>\n{search_str}', 1)
    return html

content = add_eyebrow(content, '<h1 class="hero-title">', "Who It's For", center=False)
content = add_eyebrow(content, '<h2 style="font-size: 2.2rem', "Explore By Department", center=True)
content = add_eyebrow(content, '<h2>Next-Generation AI Assessments</h2>', "AI-Powered Practice", center=False)
content = add_eyebrow(content, '<h2>Conquer Competitive Exams with Precision</h2>', "For Aspirants", center=False)
content = add_eyebrow(content, '<h2>Fostering Academic Excellence Together</h2>', 'Our Mission', center=False)
content = add_eyebrow(content, '<h2>Insights & Inquiries</h2>', 'Got Questions?', center=True)
content = add_eyebrow(content, '<h2>Ignite Your Academic Potential Today</h2>', 'Take The Next Step', center=True)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html")

# --- 2. Update CSS ---
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '/* --- Ticker Styles --- */' in css_content:
    css_content = css_content.split('/* --- Ticker Styles --- */')[0]

new_css = '''/* --- Eyebrow Ticker Styles --- */
.eyebrow-ticker {
    font-family: 'Orator Std', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent-color, #6600FF);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 12px;
    display: block;
}
'''

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content.strip() + '\n\n' + new_css)

print("Updated styles.css")
