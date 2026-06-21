import re

with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

new_html = """        <!-- 3. Browse by Department Slider -->
        <section class="py-5 bg-white" id="dept-slider-section">
            <div class="container reveal">
                <div class="department-carousel-container">
                    <!-- Slide 1 -->
                    <div class="dept-slide active" data-slide="0">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Computer Science</h3>
                            <p class="dept-slide-desc">Access detailed notes, practical lab assignments, PPTs, and comprehensive PYQs for B.Sc & M.Sc.</p>
                            <div><a href="materials.html?dept=cs" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Computer Science">
                        </div>
                    </div>
                    <!-- Slide 2 -->
                    <div class="dept-slide" data-slide="1">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Microbiology</h3>
                            <p class="dept-slide-desc">Dive into high-quality PDFs, lab manuals, and peer-reviewed lecture notes tailored for your papers.</p>
                            <div><a href="materials.html?dept=micro" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Microbiology">
                        </div>
                    </div>
                    <!-- Slide 3 -->
                    <div class="dept-slide" data-slide="2">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Statistics & Math</h3>
                            <p class="dept-slide-desc">Master complex derivations and problem sets with organized question banks and assignment solutions.</p>
                            <div><a href="materials.html?dept=stats" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Statistics & Math">
                        </div>
                    </div>
                    <!-- Slide 4 -->
                    <div class="dept-slide" data-slide="3">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Physics</h3>
                            <p class="dept-slide-desc">Comprehensive derivations, theoretical concepts, and lab manuals organized precisely by semester.</p>
                            <div><a href="materials.html?dept=physics" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1636466497217-26c8c60caa47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Physics">
                        </div>
                    </div>
                    <!-- Slide 5 -->
                    <div class="dept-slide" data-slide="4">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">B.Com (Commerce)</h3>
                            <p class="dept-slide-desc">Accounting standards, financial management notes, and previous year question papers.</p>
                            <div><a href="materials.html?dept=bcom" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Commerce">
                        </div>
                    </div>
                    <!-- Slide 6 -->
                    <div class="dept-slide" data-slide="5">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">English</h3>
                            <p class="dept-slide-desc">Literary criticisms, essay structures, and detailed chapter-by-chapter analysis.</p>
                            <div><a href="materials.html?dept=english" class="btn btn-primary mt-2">Go to department hub</a></div>
                        </div>
                        <div class="dept-slide-image-wrapper">
                            <div class="dept-slide-border"></div>
                            <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="English">
                        </div>
                    </div>
                </div>
            </div>
        </section>"""

pattern = re.compile(r'<!-- 3\. Browse by Department Slider -->.*?</section>', re.DOTALL)
html_content = re.sub(pattern, new_html, html_content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with open('css/styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Replace the previous carousel css
new_css = """/* Department Carousel */
.department-carousel-container {
    position: relative;
    width: 100%;
    height: 450px;
    background: transparent;
    border: none;
    overflow: hidden;
}

.dept-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
    pointer-events: none;
    z-index: 1;
}

.dept-slide.active {
    opacity: 1;
    pointer-events: auto;
    z-index: 2;
}

.dept-slide-content {
    width: 55%;
    padding: 60px 80px 60px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: transparent;
    z-index: 2;
}

.dept-slide-title {
    font-size: 3.5rem;
    color: var(--primary-color);
    margin-bottom: 20px;
    line-height: 1.1;
    font-weight: 900;
}

.dept-slide-desc {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-bottom: 35px;
    max-width: 90%;
    line-height: 1.6;
}

.dept-slide-image-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    width: 60%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(450px 0, 100% 0, 100% 100%, 0 100%);
    z-index: 1;
}

.dept-slide-border {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 4px;
    height: 650px;
    background: var(--primary-color);
    transform-origin: bottom left;
    transform: rotate(45deg);
    z-index: 3;
}

.dept-slide-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 6s ease;
}

.dept-slide.active .dept-slide-image-wrapper img {
    transform: scale(1.08);
}

@media (max-width: 992px) {
    .dept-slide-image-wrapper {
        clip-path: polygon(250px 0, 100% 0, 100% 100%, 0 100%);
    }
    .dept-slide-border {
        transform: rotate(29deg); /* approx for 450h/250w */
    }
}

@media (max-width: 768px) {
    .department-carousel-container {
        height: auto;
        min-height: 500px;
    }
    .dept-slide {
        flex-direction: column-reverse;
        position: relative;
        opacity: 1;
        display: none;
    }
    .dept-slide.active {
        display: flex;
    }
    .dept-slide-image-wrapper {
        position: relative;
        width: 100%;
        height: 250px;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        right: auto;
    }
    .dept-slide-border {
        display: none; /* remove slanted border on mobile */
    }
    .dept-slide-content {
        width: 100%;
        padding: 40px 0;
        text-align: center;
    }
    .dept-slide-title {
        font-size: 2.2rem;
    }
}
"""

css_pattern = re.compile(r'/\* Department Carousel \*/.*?(?=\Z|/\* --- Sticky)', re.DOTALL)
if re.search(css_pattern, css_content):
    css_content = re.sub(css_pattern, new_css, css_content)
else:
    css_content += "\n" + new_css

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css_content)
