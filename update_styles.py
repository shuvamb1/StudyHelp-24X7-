import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Change bg-white to bg-section for the dept slider section
html_content = html_content.replace('<section class="py-5 bg-white" id="dept-slider-section">', 
                                    '<section class="py-5 bg-section" id="dept-slider-section">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)


# 2. Update styles.css
with open('css/styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Make header font slightly small and bolder
css_content = re.sub(
    r'\.dept-slide-title\s*\{[^}]*\}',
    '.dept-slide-title {\n    font-size: 2.8rem;\n    color: var(--primary-color);\n    margin-bottom: 20px;\n    line-height: 1.1;\n    font-weight: 900;\n    letter-spacing: -0.5px;\n}',
    css_content
)

# Reduce text space, increase image space
css_content = re.sub(
    r'\.dept-slide-content\s*\{[^}]*\}',
    '.dept-slide-content {\n    width: 40%;\n    padding: 60px 40px 60px 0;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    background: transparent;\n    z-index: 2;\n}',
    css_content
)

# Shift border, change angle to 70 deg (164px horizontal cut on 450px height)
css_content = re.sub(
    r'\.dept-slide-image-wrapper\s*\{[^}]*\}',
    '.dept-slide-image-wrapper {\n    position: absolute;\n    top: 0;\n    right: 0;\n    width: 65%;\n    height: 100%;\n    overflow: hidden;\n    clip-path: polygon(164px 0, 100% 0, 100% 100%, 0 100%);\n    z-index: 1;\n}',
    css_content
)

# Remove the border color (hide it)
css_content = re.sub(
    r'\.dept-slide-border\s*\{[^}]*\}',
    '.dept-slide-border {\n    display: none;\n}',
    css_content
)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updates completed successfully.")
