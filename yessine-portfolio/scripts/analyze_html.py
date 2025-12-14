# HTML Analysis & Extraction Script
# This script analyzes the original page.html and extracts precise measurements

import re
import json
from pathlib import Path

def extract_css_variables(html_content):
    """Extract all CSS custom properties from inline styles"""
    variables = {}
    
    # Find all style attributes
    style_pattern = r'style="([^"]+)"'
    styles = re.findall(style_pattern, html_content)
    
    for style in styles:
        # Extract CSS variables
        var_pattern = r'--([^:]+):\s*([^;]+)'
        matches = re.findall(var_pattern, style)
        for var_name, value in matches:
            if var_name not in variables:
                variables[var_name] = []
            variables[var_name].append(value.strip())
    
    return variables

def extract_framer_styles(html_content):
    """Extract Framer-specific style presets"""
    styles = {}
    
    # Find data-styles-preset attributes
    preset_pattern = r'data-styles-preset="([^"]+)"'
    presets = set(re.findall(preset_pattern, html_content))
    
    # Find class names
    class_pattern = r'class="([^"]+)"'
    classes = re.findall(class_pattern, html_content)
    
    # Extract framer-specific classes
    framer_classes = {}
    for class_list in classes:
        for cls in class_list.split():
            if cls.startswith('framer-'):
                if cls not in framer_classes:
                    framer_classes[cls] = 0
                framer_classes[cls] += 1
    
    return {
        'presets': list(presets),
        'classes': framer_classes
    }

def extract_text_content(html_content):
    """Extract all text content with context"""
    sections = {}
    
    # Extract hero section
    hero_pattern = r'<h1[^>]*>([^<]+)</h1>'
    hero_matches = re.findall(hero_pattern, html_content)
    if hero_matches:
        sections['hero'] = hero_matches
    
    # Extract section titles (h2)
    h2_pattern = r'<h2[^>]*>([^<]+)</h2>'
    h2_matches = re.findall(h2_pattern, html_content)
    sections['section_titles'] = h2_matches
    
    # Extract subsection titles (h3)
    h3_pattern = r'<h3[^>]*>([^<]+)</h3>'
    h3_matches = re.findall(h3_pattern, html_content)
    sections['subsection_titles'] = h3_matches
    
    # Extract paragraphs
    p_pattern = r'<p[^>]*>([^<]+)</p>'
    p_matches = re.findall(p_pattern, html_content)
    sections['paragraphs'] = p_matches
    
    # Extract list items
    li_pattern = r'<li[^>]*>.*?<p[^>]*>([^<]+)</p>'
    li_matches = re.findall(li_pattern, html_content, re.DOTALL)
    sections['list_items'] = li_matches
    
    return sections

def extract_typography_specs(html_content):
    """Extract precise typography specifications"""
    typography = {
        'font_sizes': set(),
        'line_heights': set(),
        'font_weights': set(),
        'letter_spacings': set(),
        'colors': set()
    }
    
    # Extract from inline styles
    style_pattern = r'style="([^"]+)"'
    styles = re.findall(style_pattern, html_content)
    
    for style in styles:
        # Font size
        fs_match = re.search(r'font-size:\s*([^;]+)', style)
        if fs_match:
            typography['font_sizes'].add(fs_match.group(1).strip())
        
        # Line height
        lh_match = re.search(r'line-height:\s*([^;]+)', style)
        if lh_match:
            typography['line_heights'].add(lh_match.group(1).strip())
        
        # Font weight
        fw_match = re.search(r'font-weight:\s*([^;]+)', style)
        if fw_match:
            typography['font_weights'].add(fw_match.group(1).strip())
        
        # Letter spacing
        ls_match = re.search(r'letter-spacing:\s*([^;]+)', style)
        if ls_match:
            typography['letter_spacings'].add(ls_match.group(1).strip())
        
        # Colors
        color_match = re.search(r'color:\s*([^;]+)', style)
        if color_match:
            typography['colors'].add(color_match.group(1).strip())
    
    return {k: sorted(list(v)) for k, v in typography.items()}

def extract_layout_specs(html_content):
    """Extract layout measurements (gaps, padding, margins)"""
    layout = {
        'gaps': set(),
        'paddings': set(),
        'margins': set(),
        'widths': set(),
        'heights': set()
    }
    
    style_pattern = r'style="([^"]+)"'
    styles = re.findall(style_pattern, html_content)
    
    for style in styles:
        # Gap
        gap_match = re.search(r'gap:\s*([^;]+)', style)
        if gap_match:
            layout['gaps'].add(gap_match.group(1).strip())
        
        # Padding
        padding_match = re.search(r'padding:\s*([^;]+)', style)
        if padding_match:
            layout['paddings'].add(padding_match.group(1).strip())
        
        # Margin
        margin_match = re.search(r'margin:\s*([^;]+)', style)
        if margin_match:
            layout['margins'].add(margin_match.group(1).strip())
        
        # Width
        width_match = re.search(r'width:\s*([^;]+)', style)
        if width_match:
            layout['widths'].add(width_match.group(1).strip())
        
        # Height
        height_match = re.search(r'height:\s*([^;]+)', style)
        if height_match:
            layout['heights'].add(height_match.group(1).strip())
    
    return {k: sorted(list(v)) for k, v in layout.items()}

def extract_color_tokens(html_content):
    """Extract all color tokens used in the design"""
    # Find token definitions
    token_pattern = r'--token-([^:]+):\s*rgb\(([^)]+)\)'
    tokens = re.findall(token_pattern, html_content)
    
    color_tokens = {}
    for token_id, rgb_values in tokens:
        color_tokens[token_id] = rgb_values
    
    return color_tokens

def main():
    # Read the HTML file
    html_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/page.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract all data
    analysis = {
        'css_variables': extract_css_variables(html_content),
        'framer_styles': extract_framer_styles(html_content),
        'text_content': extract_text_content(html_content),
        'typography': extract_typography_specs(html_content),
        'layout': extract_layout_specs(html_content),
        'color_tokens': extract_color_tokens(html_content)
    }
    
    # Save to JSON
    output_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/yessine-portfolio/analysis/html_analysis.json')
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"Analysis complete! Results saved to {output_path}")
    print(f"\nSummary:")
    print(f"  - CSS Variables: {len(analysis['css_variables'])}")
    print(f"  - Framer Presets: {len(analysis['framer_styles']['presets'])}")
    print(f"  - Framer Classes: {len(analysis['framer_styles']['classes'])}")
    print(f"  - Color Tokens: {len(analysis['color_tokens'])}")
    print(f"  - Font Sizes: {len(analysis['typography']['font_sizes'])}")

if __name__ == '__main__':
    main()
