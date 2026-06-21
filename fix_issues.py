import re

# ── 1. Fix inline padding-top on all pages ──────────────────────────────────
pages = ['about.html', 'contact.html', 'materials.html', 'contribute.html']

for fname in pages:
    with open(fname, 'r', encoding='utf-8') as f:
        c = f.read()

    # Replace <main class="..."> with same + inline padding-top
    c = re.sub(
        r'<main class="about-content">',
        '<main class="about-content" style="padding-top:110px;">',
        c
    )
    c = re.sub(
        r'<main class="container">',
        '<main class="container" style="padding-top:110px;">',
        c
    )

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Fixed padding: {fname}')

# ── 2. Fix Sign Up button visibility in dropdown ─────────────────────────────
# The btn-primary in dropdown inherits white background from the nav panel,
# but link color overrides may strip the text color. We'll force it in CSS.
with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add explicit color rule for mobile dropdown buttons so they're never invisible
fix = """
/* Ensure mobile dropdown buttons have correct text color */
.mobile-only-actions .btn-primary {
  color: #ffffff !important;
  background-color: var(--button-dark) !important;
}
.mobile-only-actions .btn-outline {
  color: var(--text-main) !important;
  border: 1px solid #E5E7EB !important;
}
"""

# Insert after .mobile-only-actions .btn block
css = css.replace(
    '/* Mobile Nav Toggle */',
    fix + '/* Mobile Nav Toggle */'
)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('Fixed dropdown button colors in CSS')
