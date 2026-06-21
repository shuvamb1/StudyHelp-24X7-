import re

nav_new = '''                <ul class="nav-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="materials.html">Study Materials</a></li>
                    <li><a href="contribute.html">Contribute</a></li>
                    <li><a href="about.html">About Us</a></li>
                
                    <li class="mobile-only-actions">
                        <a href="login.html" class="btn btn-outline" style="width: 100%; text-align: center; margin-bottom: 10px;">Login</a>
                        <a href="register.html" class="btn btn-primary" style="width: 100%; text-align: center;">Sign Up</a>
                    </li></ul>'''

for fname in ['about.html', 'contact.html', 'materials.html', 'login.html', 'register.html', 'contribute.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the ul.nav-links block
    new_content = re.sub(
        r'<ul class="nav-links">.*?</ul>',
        nav_new,
        content,
        flags=re.DOTALL
    )

    if new_content != content:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated: {fname}')
    else:
        print(f'No change: {fname}')
