import os
import glob
import re

# 1. Update CSS
css_additions = """
/* --- Sticky Header Utility Classes --- */
.fixed { position: fixed; }
.top-0 { top: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.z-50 { z-index: 50; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.pt-3 { padding-top: 0.75rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.max-w-5xl { max-width: 64rem; }
.rounded-2xl { border-radius: 1rem; }
.border { border-width: 1px; border-style: solid; }
.border-transparent { border-color: transparent; }
.bg-transparent { background-color: transparent; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.transition-\\[background-color\\,border-color\\,box-shadow\\,backdrop-filter\\] {
    transition-property: background-color, border-color, box-shadow, backdrop-filter, -webkit-backdrop-filter;
}
.duration-300 { transition-duration: 300ms; }

.border-outline-variant\\/30 { border-color: rgba(229, 231, 235, 0.3); }
.bg-surface\\/85 { background-color: rgba(255, 255, 255, 0.85); }

@media (min-width: 768px) {
    .md\\:backdrop-blur-xl {
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
    }
}
"""

with open("css/styles.css", "r", encoding="utf-8") as f:
    css_content = f.read()

# remove old header styles
css_content = re.sub(r'header\s*\{[^}]+\}', 'header {\n  /* Styles replaced by utility classes */\n}', css_content)

if "Sticky Header Utility Classes" not in css_content:
    with open("css/styles.css", "a", encoding="utf-8") as f:
        f.write(css_additions)

# 2. Update JS
with open("js/main.js", "r", encoding="utf-8") as f:
    js_content = f.read()

old_scroll_logic = """  // Header Scroll Effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      header.style.backdropFilter = 'blur(10px)';
    } else {
      header.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
      header.style.backgroundColor = '#FFFFFF';
      header.style.backdropFilter = 'none';
    }
  });"""

new_scroll_logic = """  // Header Scroll Effect
  const navbar = document.querySelector('nav.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.remove('border-transparent', 'bg-transparent');
      navbar.classList.add('border-outline-variant/30', 'bg-surface/85', 'md:backdrop-blur-xl', 'shadow-sm');
    } else {
      navbar.classList.remove('border-outline-variant/30', 'bg-surface/85', 'md:backdrop-blur-xl', 'shadow-sm');
      navbar.classList.add('border-transparent', 'bg-transparent');
    }
  });"""

if old_scroll_logic in js_content:
    js_content = js_content.replace(old_scroll_logic, new_scroll_logic)
    with open("js/main.js", "w", encoding="utf-8") as f:
        f.write(js_content)

# 3. Update HTML files
html_files = glob.glob("*.html")
for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace <header>
    content = content.replace('<header>', '<header class="fixed top-0 left-0 right-0 z-50 px-4 pt-3">')
    
    # Replace <nav class="navbar">
    # Note: we also want to remove the <div class="container"> that wraps navbar if possible to prevent double padding,
    # or just let it be. The user said Navigation Bar gets 'mx-auto max-w-5xl px-4 rounded-2xl...' which replaces the container's max-width.
    # Let's see the structure:
    # <header>
    #     <div class="container">
    #         <nav class="navbar">
    
    # Let's replace `<nav class="navbar">` with `<nav class="navbar mx-auto max-w-5xl px-4 rounded-2xl transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 border border-transparent bg-transparent">`
    content = content.replace('<nav class="navbar">', '<nav class="navbar mx-auto max-w-5xl px-4 rounded-2xl transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 border border-transparent bg-transparent">')
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Updated successfully")
