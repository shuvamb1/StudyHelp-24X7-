import re

with open('c:/Users/shuva/OneDrive/Desktop/StudyHelp-24X7/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def generate_ticker(items):
    items_html = ''.join(f'<span>✦ {item} ✦</span>' for item in items * 2)
    return f'''
        <div class="ticker-wrap">
            <div class="ticker-content">
                {items_html}
            </div>
        </div>
'''

# 1. Hero Section
hero_ticker = generate_ticker(['Welcome to StudyHelp 24x7', 'Your Academic Compass', 'Master Every Semester', 'Empowering Xavierians'])
content = content.replace('</h1>', '</h1><!--TICKER_PLACEHOLDER-->') 
content = content.replace('<h1 class="hero-title">Your Complete Academic Hub at <span style="color: #6600FF;">St. Xavier\'s College</span></h1><!--TICKER_PLACEHOLDER-->', 
'<h1 class="hero-title">Elevate Your Academic Journey at <span style="color: #6600FF;">St. Xavier\'s College</span></h1>')
content = content.replace('</section>', '</section>' + hero_ticker, 1)

# 2. Dept Slider Section
dept_ticker = generate_ticker(['Explore Academic Disciplines', 'Comprehensive Study Guides', 'Department-Wise Resources', 'Curated For Excellence'])
dept_header = '''
            <div class="container reveal">
                <div class="text-center mb-4">
                    <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 10px;">Explore Academic Disciplines</h2>
                    <p style="color: var(--text-muted); font-size: 1.1rem;">Curated resources across our core departments</p>
                </div>
'''
content = content.replace('<section class="py-5 bg-section" id="dept-slider-section">', '<section class="py-5 bg-section" id="dept-slider-section">\n' + dept_ticker)
content = content.replace('<div class="container reveal">\n                <div class="department-carousel-container">', dept_header + '                <div class="department-carousel-container">')

# 3. AI Mock Test Section (first mocktest-section)
mock1_ticker = generate_ticker(['AI-Driven Adaptive Learning', 'Real-Time Performance Analytics', 'Identify Your Weaknesses', 'Exam Confidence Builder'])
content = content.replace('<section class="mocktest-section">', '<section class="mocktest-section">\n' + mock1_ticker, 1)
content = content.replace('<h2>AI-Powered Mock Tests</h2>', '<h2>Next-Generation AI Assessments</h2>')

# 4. Competitive Mock Test Section (second mocktest-section)
mock2_ticker = generate_ticker(['NEET & JEE Preparedness', 'Advanced Question Banks', 'Secure Anti-Cheat Environment', 'Real Exam Simulation'])
# There are two mocktest-section classes. The second one will be modified.
parts = content.split('<section class="mocktest-section">')
if len(parts) == 3:
    content = parts[0] + '<section class="mocktest-section">' + parts[1] + '<section class="mocktest-section">\n' + mock2_ticker + parts[2]
content = content.replace('<h2>Competitive Exam Mock Tests</h2>', '<h2>Conquer Competitive Exams with Precision</h2>')

# 5. About Section
about_ticker = generate_ticker(['Built By Students, For Students', 'Collaborative Success', 'Community-Driven Platform', 'Democratizing Education'])
content = content.replace('<h2>Empowering Xavierians Academically</h2>', '<h2>Fostering Academic Excellence Together</h2>')
parts2 = content.split('<!-- 5. Improved About Section -->\n        <section class="py-5 bg-section">')
if len(parts2) == 2:
    content = parts2[0] + '<!-- 5. Improved About Section -->\n        <section class="py-5 bg-section">\n' + about_ticker + parts2[1]

# 6. FAQ Section
faq_ticker = generate_ticker(['Everything You Need To Know', 'Clear Your Doubts', 'Seamless Support', '24x7 Assistance'])
content = content.replace('<h2>Frequently Asked Questions</h2>', '<h2>Insights & Inquiries</h2>')
content = content.replace('<section id="faq" class="py-5 bg-section">', '<section id="faq" class="py-5 bg-section">\n' + faq_ticker)

# 7. CTA Section
cta_ticker = generate_ticker(['Join 500+ Active Students', 'Access 2000+ Materials', 'Your Success Story Starts Here', 'Free For All Xavierians'])
content = content.replace('<h2>Start Learning Smarter Today</h2>', '<h2>Ignite Your Academic Potential Today</h2>')
content = content.replace('<section class="cta-section">', '<section class="cta-section">\n' + cta_ticker)

with open('c:/Users/shuva/OneDrive/Desktop/StudyHelp-24X7/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html')
