# Extract Styles from Framer CDN URLs
# This script downloads and parses CSS/JS from Framer CDN to extract styles

import re
import json
import requests
from pathlib import Path
from urllib.parse import urlparse

def extract_cdn_urls(html_content):
    """Extract all Framer CDN URLs from HTML"""
    urls = {
        'css': [],
        'js': [],
        'fonts': [],
        'images': []
    }
    
    # CSS links
    css_pattern = r'<link[^>]*href="(https://framerusercontent\.com/[^"]+\.css[^"]*)"'
    urls['css'] = re.findall(css_pattern, html_content)
    
    # JavaScript scripts
    js_pattern = r'<script[^>]*src="(https://framerusercontent\.com/[^"]+\.js[^"]*)"'
    urls['js'] = re.findall(js_pattern, html_content)
    
    # Also check for inline script tags with CDN URLs
    inline_js_pattern = r'src:\s*url\("(https://framerusercontent\.com/[^"]+\.js[^"]*)"\)'
    urls['js'].extend(re.findall(inline_js_pattern, html_content))
    
    # Font URLs
    font_pattern = r'url\("(https://framerusercontent\.com/[^"]+\.woff2?[^"]*)"\)'
    urls['fonts'] = re.findall(font_pattern, html_content)
    
    # Image URLs
    img_pattern = r'src="(https://framerusercontent\.com/images/[^"]+)"'
    urls['images'] = re.findall(img_pattern, html_content)
    
    return urls

def parse_css_content(css_text):
    """Extract styles from CSS content"""
    styles = {
        'classes': {},
        'variables': {},
        'keyframes': [],
        'media_queries': []
    }
    
    # Extract CSS custom properties
    var_pattern = r'--([^:]+):\s*([^;]+);'
    variables = re.findall(var_pattern, css_text)
    for var_name, value in variables:
        styles['variables'][var_name.strip()] = value.strip()
    
    # Extract class definitions
    class_pattern = r'\.([a-zA-Z0-9_-]+)\s*{([^}]+)}'
    classes = re.findall(class_pattern, css_text)
    for class_name, rules in classes:
        # Parse individual rules
        rule_pattern = r'([a-z-]+):\s*([^;]+);'
        rule_matches = re.findall(rule_pattern, rules)
        styles['classes'][class_name] = dict(rule_matches)
    
    # Extract keyframes
    keyframe_pattern = r'@keyframes\s+([a-zA-Z0-9_-]+)\s*{([^}]+)}'
    keyframes = re.findall(keyframe_pattern, css_text)
    styles['keyframes'] = [{'name': name, 'rules': rules.strip()} for name, rules in keyframes]
    
    # Extract media queries
    media_pattern = r'@media\s*([^{]+){([^}]+)}'
    media_queries = re.findall(media_pattern, css_text)
    styles['media_queries'] = [{'condition': cond.strip(), 'rules': rules.strip()} for cond, rules in media_queries]
    
    return styles

def parse_inline_styles(html_content):
    """Extract all inline styles from HTML"""
    inline_styles = []
    
    # Find all style attributes
    style_pattern = r'<[^>]*class="([^"]*)"[^>]*style="([^"]+)"'
    matches = re.findall(style_pattern, html_content)
    
    for classes, style in matches:
        # Parse the style rules
        rules = {}
        rule_pattern = r'([a-z-]+):\s*([^;]+);?'
        rule_matches = re.findall(rule_pattern, style)
        rules = dict(rule_matches)
        
        inline_styles.append({
            'classes': classes,
            'styles': rules
        })
    
    return inline_styles

def extract_framer_components(html_content):
    """Extract Framer component structure and data attributes"""
    components = {}
    
    # Find data-framer-name attributes
    name_pattern = r'data-framer-name="([^"]+)"[^>]*class="([^"]*)"'
    matches = re.findall(name_pattern, html_content)
    
    for name, classes in matches:
        if name not in components:
            components[name] = []
        components[name].append(classes)
    
    return components

def download_cdn_resource(url, output_dir):
    """Download a resource from Framer CDN"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Parse filename from URL
        parsed_url = urlparse(url)
        filename = Path(parsed_url.path).name
        
        # Ensure output directory exists
        output_path = output_dir / filename
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the file
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        return output_path, response.text if 'text' in response.headers.get('content-type', '') else None
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None, None

def analyze_framer_css_classes(html_content):
    """Extract and categorize Framer-specific CSS classes"""
    framer_classes = {
        'layout': [],
        'typography': [],
        'effects': [],
        'components': [],
        'states': []
    }
    
    # Find all unique classes
    class_pattern = r'class="([^"]+)"'
    all_classes = re.findall(class_pattern, html_content)
    
    unique_classes = set()
    for class_list in all_classes:
        unique_classes.update(class_list.split())
    
    # Categorize classes
    for cls in unique_classes:
        if cls.startswith('framer-'):
            if any(x in cls for x in ['flex', 'grid', 'stack', 'container']):
                framer_classes['layout'].append(cls)
            elif any(x in cls for x in ['text', 'styles-preset']):
                framer_classes['typography'].append(cls)
            elif any(x in cls for x in ['shadow', 'blur', 'border']):
                framer_classes['effects'].append(cls)
            elif any(x in cls for x in ['hover', 'active', 'focus']):
                framer_classes['states'].append(cls)
            else:
                framer_classes['components'].append(cls)
    
    return framer_classes

def main():
    print("Starting Framer CDN extraction...")
    
    # Read HTML
    html_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/page.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Create output directory
    output_dir = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/yessine-portfolio/analysis')
    output_dir.mkdir(exist_ok=True)
    
    # Extract CDN URLs
    print("\n1. Extracting CDN URLs...")
    cdn_urls = extract_cdn_urls(html_content)
    
    # Save URLs
    with open(output_dir / 'cdn_urls.json', 'w') as f:
        json.dump(cdn_urls, f, indent=2)
    
    print(f"   Found {len(cdn_urls['css'])} CSS files")
    print(f"   Found {len(cdn_urls['js'])} JS files")
    print(f"   Found {len(cdn_urls['fonts'])} font files")
    print(f"   Found {len(cdn_urls['images'])} images")
    
    # Download and parse CSS files
    print("\n2. Downloading CSS files...")
    cdn_dir = output_dir / 'cdn_resources'
    cdn_dir.mkdir(exist_ok=True)
    
    all_css_styles = {}
    for i, css_url in enumerate(cdn_urls['css'][:3]):  # Limit to first 3 to avoid too many requests
        print(f"   Downloading CSS {i+1}/{min(3, len(cdn_urls['css']))}: {css_url[:60]}...")
        file_path, content = download_cdn_resource(css_url, cdn_dir)
        
        if content:
            styles = parse_css_content(content)
            all_css_styles[f'css_{i+1}'] = {
                'url': css_url,
                'styles': styles
            }
    
    # Save parsed CSS styles
    with open(output_dir / 'cdn_css_styles.json', 'w') as f:
        json.dump(all_css_styles, f, indent=2)
    
    # Extract inline styles
    print("\n3. Extracting inline styles...")
    inline_styles = parse_inline_styles(html_content)
    
    with open(output_dir / 'inline_styles.json', 'w') as f:
        json.dump(inline_styles, f, indent=2)
    
    print(f"   Found {len(inline_styles)} elements with inline styles")
    
    # Extract Framer components
    print("\n4. Extracting Framer components...")
    components = extract_framer_components(html_content)
    
    with open(output_dir / 'framer_components.json', 'w') as f:
        json.dump(components, f, indent=2)
    
    print(f"   Found {len(components)} unique component names")
    
    # Categorize Framer classes
    print("\n5. Categorizing Framer CSS classes...")
    framer_classes = analyze_framer_css_classes(html_content)
    
    with open(output_dir / 'framer_classes_categorized.json', 'w') as f:
        json.dump(framer_classes, f, indent=2)
    
    print(f"   Layout classes: {len(framer_classes['layout'])}")
    print(f"   Typography classes: {len(framer_classes['typography'])}")
    print(f"   Effect classes: {len(framer_classes['effects'])}")
    print(f"   Component classes: {len(framer_classes['components'])}")
    
    # Create summary
    summary = {
        'cdn_urls': {k: len(v) for k, v in cdn_urls.items()},
        'inline_styles_count': len(inline_styles),
        'components_count': len(components),
        'framer_classes_by_category': {k: len(v) for k, v in framer_classes.items()},
        'css_files_analyzed': len(all_css_styles),
        'total_css_variables': sum(len(s['styles']['variables']) for s in all_css_styles.values()),
        'total_css_classes': sum(len(s['styles']['classes']) for s in all_css_styles.values())
    }
    
    with open(output_dir / 'framer_extraction_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("\n" + "="*60)
    print("EXTRACTION COMPLETE!")
    print("="*60)
    print(f"\nResults saved to: {output_dir}")
    print(f"\nSummary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    
    print("\n📁 Generated files:")
    print("  - cdn_urls.json (all CDN resource URLs)")
    print("  - cdn_css_styles.json (parsed CSS from CDN)")
    print("  - inline_styles.json (all inline styles)")
    print("  - framer_components.json (component structure)")
    print("  - framer_classes_categorized.json (categorized classes)")
    print("  - framer_extraction_summary.json (summary report)")

if __name__ == '__main__':
    main()
