# Content Extraction Script
# Extracts structured content from page.html for JSON data file

import re
import json
from pathlib import Path
from bs4 import BeautifulSoup

def extract_resume_data(html_content):
    """Extract all resume content in structured format"""
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    resume_data = {
        'name': '',
        'about': {
            'title': '',
            'items': [],
            'bio': '',
            'image': ''
        },
        'competences': {
            'title': '',
            'skills': {'title': '', 'items': []},
            'outils': {'title': '', 'items': []},
            'techStack': {'title': '', 'items': []},
            'langues': {'title': '', 'items': []}
        },
        'experience': {
            'title': '',
            'jobs': []
        }
    }
    
    # Extract name from main heading
    name_elem = soup.find('h1', class_=lambda x: x and 'framer-text' in x)
    if name_elem:
        # Name might be split across multiple lines/spans
        resume_data['name'] = name_elem.get_text(strip=True)
    
    # Extract About section
    about_section = soup.find(string=re.compile('À propos'))
    if about_section:
        about_parent = about_section.find_parent('div')
        if about_parent:
            next_sibling = about_parent.find_next_sibling()
            if next_sibling:
                items = next_sibling.find_all('p', class_='framer-text')
                resume_data['about']['items'] = [item.get_text(strip=True) for item in items]
    
    # Extract bio
    bio_elem = soup.find(string=re.compile('Quand je ne suis pas'))
    if bio_elem:
        resume_data['about']['bio'] = bio_elem.strip()
    
    # Extract Competences sections
    competences_section = soup.find(string=re.compile('Compétences'))
    
    # Extract Skills
    skills_title = soup.find(string='Skills')
    if skills_title:
        skills_parent = skills_title.find_parent()
        if skills_parent:
            next_list = skills_parent.find_next_sibling('ul')
            if next_list:
                items = next_list.find_all('p', class_='framer-text')
                resume_data['competences']['skills']['items'] = [item.get_text(strip=True) for item in items]
    
    # Extract Outils
    outils_title = soup.find(string='Outils')
    if outils_title:
        outils_parent = outils_title.find_parent()
        if outils_parent:
            next_list = outils_parent.find_next_sibling('ul')
            if next_list:
                items = next_list.find_all('p', class_='framer-text')
                resume_data['competences']['outils']['items'] = [item.get_text(strip=True) for item in items]
    
    # Extract Tech Stack
    tech_title = soup.find(string='Tech Stack')
    if tech_title:
        tech_parent = tech_title.find_parent()
        if tech_parent:
            next_list = tech_parent.find_next_sibling('ul')
            if next_list:
                items = next_list.find_all('p', class_='framer-text')
                resume_data['competences']['techStack']['items'] = [item.get_text(strip=True) for item in items]
    
    # Extract Langues
    langues_title = soup.find(string='Langues')
    if langues_title:
        langues_parent = langues_title.find_parent()
        if langues_parent:
            next_list = langues_parent.find_next_sibling('ul')
            if next_list:
                items = next_list.find_all('p', class_='framer-text')
                resume_data['competences']['langues']['items'] = [item.get_text(strip=True) for item in items]
    
    # Extract Work Experience
    experience_section = soup.find(string=re.compile('Expérience'))
    
    # Find all job entries
    job_titles = soup.find_all('h3', class_='framer-text')
    jobs = []
    job_id = 1
    
    for title_elem in job_titles:
        title_text = title_elem.get_text(strip=True)
        
        # Skip section titles
        if title_text in ['À propos', 'Skills', 'Outils', 'Tech Stack', 'Langues']:
            continue
        
        # Look for job details in siblings
        parent = title_elem.find_parent()
        if parent:
            # Find period, company, location
            info_divs = parent.find_all('p', class_='framer-text')
            
            period = ''
            company = ''
            location = ''
            description = ''
            
            for info in info_divs:
                text = info.get_text(strip=True)
                if '202' in text or 'Présent' in text:
                    period = text
                elif text in ['Indépendant', 'Redesk', 'TechCorp']:
                    company = text
                elif 'Télétravail' in text or 'Paris' in text or 'Remote' in text:
                    location = text
            
            # Find description
            desc_parent = title_elem.find_parent().find_parent()
            if desc_parent:
                desc_elem = desc_parent.find('p', class_='framer-text', string=lambda x: x and len(x) > 50)
                if desc_elem:
                    description = desc_elem.get_text(strip=True)
            
            if title_text and period:
                jobs.append({
                    'id': job_id,
                    'title': title_text,
                    'company': company,
                    'period': period,
                    'location': location,
                    'description': description,
                    'isCurrent': 'Présent' in period or 'Current' in period
                })
                job_id += 1
    
    resume_data['experience']['jobs'] = jobs
    
    return resume_data

def main():
    # Read HTML
    html_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/page.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract data
    resume_data = extract_resume_data(html_content)
    
    # Save to JSON
    output_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/yessine-portfolio/app/data/resume_extracted.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resume_data, f, indent=2, ensure_ascii=False)
    
    print(f"Content extracted! Results saved to {output_path}")
    print(f"\nExtracted:")
    print(f"  - Name: {resume_data['name']}")
    print(f"  - About items: {len(resume_data['about']['items'])}")
    print(f"  - Skills: {len(resume_data['competences']['skills']['items'])}")
    print(f"  - Jobs: {len(resume_data['experience']['jobs'])}")

if __name__ == '__main__':
    main()
