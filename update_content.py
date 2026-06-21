import os

file_path = 'index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "Access detailed notes, practical lab assignments, PPTs, and comprehensive PYQs for B.Sc & M.Sc.": 
    "Access detailed notes, practical lab assignments, presentation slides, and comprehensive Previous Year Question (PYQ) papers tailored specifically for both B.Sc and M.Sc curriculums. From core programming algorithms to advanced data structures, everything is meticulously organized to ensure you're exam-ready.",
    
    "Dive into high-quality PDFs, lab manuals, and peer-reviewed lecture notes tailored for your papers.": 
    "Dive into high-quality PDFs, rigorous lab manuals, and peer-reviewed lecture notes precisely curated for your specialized papers. Master complex microbiological concepts, immunology, and genetics through a vast collection of student-verified resources designed for St. Xavier's demanding syllabus.",
    
    "Master complex derivations and problem sets with organized question banks and assignment solutions.": 
    "Master complex derivations, theorems, and challenging problem sets with our neatly organized question banks and step-by-step assignment solutions. Whether you're tackling calculus, linear algebra, or advanced probability distributions, find the exact study aids you need to excel.",
    
    "Comprehensive derivations, theoretical concepts, and lab manuals organized precisely by semester.": 
    "Explore comprehensive derivations, in-depth theoretical concepts, and meticulously documented lab manuals organized precisely by semester. Access premium study guides covering classical mechanics, quantum physics, and electromagnetism to build a robust foundational understanding.",
    
    "Accounting standards, financial management notes, and previous year question papers.": 
    "Stay ahead with up-to-date accounting standards, advanced financial management notes, business law summaries, and an extensive archive of previous year question papers. Empower your commerce journey with resources that simplify complex corporate taxation and economics topics.",
    
    "Literary criticisms, essay structures, and detailed chapter-by-chapter analysis.": 
    "Delve deep into comprehensive literary criticisms, structural essay outlines, and detailed chapter-by-chapter thematic analysis. Access rich study materials covering classical literature to modern poetry, curated to help you craft compelling arguments and secure top grades."
}

for old_text, new_text in replacements.items():
    content = content.replace(old_text, new_text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Content updated successfully.")
