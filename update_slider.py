import os
import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

new_section = """        <!-- 3. Browse by Department Slider -->
        <section class="py-5 bg-section" id="dept-slider-section">
            <div class="container reveal">
                <div class="department-carousel-container">
                    <!-- Slide 1 -->
                    <div class="dept-slide active" data-slide="0">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Computer Science</h3>
                            <p class="dept-slide-desc">Access detailed notes, practical lab assignments, PPTs, and comprehensive PYQs for B.Sc & M.Sc.</p>
                            <a href="materials.html?dept=cs" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Computer Science">
                        </div>
                    </div>
                    <!-- Slide 2 -->
                    <div class="dept-slide" data-slide="1">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Microbiology</h3>
                            <p class="dept-slide-desc">Dive into high-quality PDFs, lab manuals, and peer-reviewed lecture notes tailored for your papers.</p>
                            <a href="materials.html?dept=micro" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Microbiology">
                        </div>
                    </div>
                    <!-- Slide 3 -->
                    <div class="dept-slide" data-slide="2">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Statistics & Math</h3>
                            <p class="dept-slide-desc">Master complex derivations and problem sets with organized question banks and assignment solutions.</p>
                            <a href="materials.html?dept=stats" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Statistics & Math">
                        </div>
                    </div>
                    <!-- Slide 4 -->
                    <div class="dept-slide" data-slide="3">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">Physics</h3>
                            <p class="dept-slide-desc">Comprehensive derivations, theoretical concepts, and lab manuals organized precisely by semester.</p>
                            <a href="materials.html?dept=physics" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1636466497217-26c8c60caa47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Physics">
                        </div>
                    </div>
                    <!-- Slide 5 -->
                    <div class="dept-slide" data-slide="4">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">B.Com (Commerce)</h3>
                            <p class="dept-slide-desc">Accounting standards, financial management notes, and previous year question papers.</p>
                            <a href="materials.html?dept=bcom" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Commerce">
                        </div>
                    </div>
                    <!-- Slide 6 -->
                    <div class="dept-slide" data-slide="5">
                        <div class="dept-slide-content">
                            <h3 class="dept-slide-title">English</h3>
                            <p class="dept-slide-desc">Literary criticisms, essay structures, and detailed chapter-by-chapter analysis.</p>
                            <a href="materials.html?dept=english" class="btn btn-primary mt-2">Go to department hub</a>
                        </div>
                        <div class="dept-slide-divider"></div>
                        <div class="dept-slide-image">
                            <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="English">
                        </div>
                    </div>
                </div>
            </div>
        </section>"""

pattern = re.compile(r'<!-- 3\. Browse by Department -->.*?</section>', re.DOTALL)
new_html_content = re.sub(pattern, new_section, html_content)

if new_html_content != html_content:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html_content)
    print("Updated index.html successfully.")
else:
    print("Could not find section to replace in index.html.")

# 2. Update styles.css
css_carousel = """
/* Department Carousel */
.department-carousel-container {
    position: relative;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    height: 450px;
    background: var(--bg-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid #E5E7EB;
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
    flex: 1;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--bg-white);
}

.dept-slide-title {
    font-size: 2.8rem;
    color: var(--primary-color);
    margin-bottom: 15px;
    line-height: 1.2;
    font-weight: 800;
}

.dept-slide-desc {
    font-size: 1.15rem;
    color: var(--text-muted);
    margin-bottom: 35px;
    max-width: 95%;
    line-height: 1.6;
}

.dept-slide-divider {
    width: 2px;
    background: linear-gradient(to bottom, transparent, #E5E7EB, transparent);
    height: 100%;
}

.dept-slide-image {
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.dept-slide-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 6s ease;
}

.dept-slide.active .dept-slide-image img {
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .department-carousel-container {
        height: auto;
        min-height: 500px;
    }
    .dept-slide {
        flex-direction: column;
    }
    .dept-slide-divider {
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, transparent, #E5E7EB, transparent);
    }
    .dept-slide-image {
        min-height: 250px;
    }
    .dept-slide-content {
        padding: 40px 20px;
        text-align: center;
    }
    .dept-slide-desc {
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
    }
    .dept-slide-title {
        font-size: 2.2rem;
    }
}
"""
with open('css/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_carousel)

# 3. Update main.js
js_carousel = """

  // Department Carousel Logic
  const deptSlides = document.querySelectorAll('.dept-slide');
  if (deptSlides.length > 0) {
      let currentSlide = 0;
      
      const nextSlide = () => {
          deptSlides[currentSlide].classList.remove('active');
          currentSlide = (currentSlide + 1) % deptSlides.length;
          deptSlides[currentSlide].classList.add('active');
      };
      
      // Change slide every 4 seconds
      setInterval(nextSlide, 4000);
  }
"""

with open('js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

if "Department Carousel Logic" not in js_content:
    new_js_content = js_content + "\\n\\ndocument.addEventListener('DOMContentLoaded', () => {" + js_carousel + "});\\n"
    with open('js/main.js', 'w', encoding='utf-8') as f:
        f.write(new_js_content)
