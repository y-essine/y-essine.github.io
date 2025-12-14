# Complete Style Extraction Script
# Extracts ALL styles including computed values from the HTML

import re
import json
from pathlib import Path
from collections import defaultdict

def extract_complete_style_system(html_content):
    """Extract comprehensive style system from HTML"""
    
    style_system = {
        'color_palette': {},
        'typography_scale': {},
        'spacing_scale': set(),
        'border_radius': set(),
        'shadows': set(),
        'transitions': set(),
        'z_index': set(),
        'breakpoints': {}
    }
    
    # Extract all style attributes
    style_pattern = r'style="([^"]+)"'
    all_styles = re.findall(style_pattern, html_content)
    
    for style_attr in all_styles:
        # Colors
        color_patterns = [
            r'color:\s*rgb\(([^)]+)\)',
            r'background-color:\s*rgb\(([^)]+)\)',
            r'border-color:\s*rgb\(([^)]+)\)'
        ]
        for pattern in color_patterns:
            matches = re.findall(pattern, style_attr)
            for match in matches:
                style_system['color_palette'][f'rgb({match})'] = match
        
        # Font sizes
        font_size_match = re.search(r'font-size:\s*([^;]+)', style_attr)
        if font_size_match:
            size = font_size_match.group(1).strip()
            if size not in style_system['typography_scale']:
                style_system['typography_scale'][size] = []
            
        # Line heights
        line_height_match = re.search(r'line-height:\s*([^;]+)', style_attr)
        if line_height_match:
            lh = line_height_match.group(1).strip()
            if 'line_height' not in style_system['typography_scale']:
                style_system['typography_scale']['line_height'] = set()
            style_system['typography_scale']['line_height'].add(lh)
        
        # Letter spacing
        letter_spacing_match = re.search(r'letter-spacing:\s*([^;]+)', style_attr)
        if letter_spacing_match:
            ls = letter_spacing_match.group(1).strip()
            if 'letter_spacing' not in style_system['typography_scale']:
                style_system['typography_scale']['letter_spacing'] = set()
            style_system['typography_scale']['letter_spacing'].add(ls)
        
        # Spacing (margin, padding, gap)
        spacing_patterns = [
            r'margin:\s*([^;]+)',
            r'padding:\s*([^;]+)',
            r'gap:\s*([^;]+)',
            r'margin-top:\s*([^;]+)',
            r'margin-bottom:\s*([^;]+)',
            r'padding-top:\s*([^;]+)',
            r'padding-bottom:\s*([^;]+)'
        ]
        for pattern in spacing_patterns:
            matches = re.findall(pattern, style_attr)
            style_system['spacing_scale'].update(matches)
        
        # Border radius
        border_radius_match = re.search(r'border-radius:\s*([^;]+)', style_attr)
        if border_radius_match:
            style_system['border_radius'].add(border_radius_match.group(1).strip())
        
        # Box shadow
        shadow_match = re.search(r'box-shadow:\s*([^;]+)', style_attr)
        if shadow_match:
            style_system['shadows'].add(shadow_match.group(1).strip())
        
        # Transitions
        transition_match = re.search(r'transition:\s*([^;]+)', style_attr)
        if transition_match:
            style_system['transitions'].add(transition_match.group(1).strip())
        
        # Z-index
        z_index_match = re.search(r'z-index:\s*([^;]+)', style_attr)
        if z_index_match:
            style_system['z_index'].add(z_index_match.group(1).strip())
    
    # Convert sets to sorted lists
    style_system['spacing_scale'] = sorted(list(style_system['spacing_scale']))
    style_system['border_radius'] = sorted(list(style_system['border_radius']))
    style_system['shadows'] = list(style_system['shadows'])
    style_system['transitions'] = list(style_system['transitions'])
    style_system['z_index'] = sorted(list(style_system['z_index']))
    
    if 'line_height' in style_system['typography_scale']:
        style_system['typography_scale']['line_height'] = sorted(list(style_system['typography_scale']['line_height']))
    if 'letter_spacing' in style_system['typography_scale']:
        style_system['typography_scale']['letter_spacing'] = sorted(list(style_system['typography_scale']['letter_spacing']))
    
    return style_system

def extract_layout_patterns(html_content):
    """Extract common layout patterns"""
    
    patterns = {
        'flex_layouts': [],
        'grid_layouts': [],
        'positioning': defaultdict(list)
    }
    
    style_pattern = r'class="([^"]+)"[^>]*style="([^"]+)"'
    matches = re.findall(style_pattern, html_content)
    
    for classes, style in matches:
        # Flexbox
        if 'display: flex' in style or 'display:flex' in style:
            flex_props = {
                'justify-content': re.search(r'justify-content:\s*([^;]+)', style),
                'align-items': re.search(r'align-items:\s*([^;]+)', style),
                'flex-direction': re.search(r'flex-direction:\s*([^;]+)', style),
                'gap': re.search(r'gap:\s*([^;]+)', style)
            }
            flex_layout = {k: v.group(1).strip() if v else None for k, v in flex_props.items()}
            flex_layout['classes'] = classes
            patterns['flex_layouts'].append(flex_layout)
        
        # Grid
        if 'display: grid' in style or 'display:grid' in style:
            grid_props = {
                'grid-template-columns': re.search(r'grid-template-columns:\s*([^;]+)', style),
                'grid-gap': re.search(r'grid-gap:\s*([^;]+)', style),
                'gap': re.search(r'gap:\s*([^;]+)', style)
            }
            grid_layout = {k: v.group(1).strip() if v else None for k, v in grid_props.items()}
            grid_layout['classes'] = classes
            patterns['grid_layouts'].append(grid_layout)
        
        # Positioning
        position_match = re.search(r'position:\s*([^;]+)', style)
        if position_match:
            pos_type = position_match.group(1).strip()
            patterns['positioning'][pos_type].append({
                'classes': classes,
                'top': re.search(r'top:\s*([^;]+)', style),
                'right': re.search(r'right:\s*([^;]+)', style),
                'bottom': re.search(r'bottom:\s*([^;]+)', style),
                'left': re.search(r'left:\s*([^;]+)', style)
            })
    
    return patterns

def create_design_tokens_file(style_system, output_dir):
    """Generate TypeScript design tokens file"""
    
    ts_content = '''// Design Tokens extracted from original Framer site
// Auto-generated - DO NOT EDIT MANUALLY

export const designTokens = {
  colors: {
'''
    
    # Add colors
    for i, (rgb_val, components) in enumerate(style_system['color_palette'].items()):
        color_name = f'color{i+1}'
        ts_content += f'    {color_name}: "{rgb_val}",  // rgb({components})\n'
    
    ts_content += '''  },
  
  typography: {
    fontSize: {
'''
    
    # Add font sizes
    if isinstance(style_system['typography_scale'], dict):
        for size_key, size_val in style_system['typography_scale'].items():
            if size_key not in ['line_height', 'letter_spacing']:
                ts_content += f'      "{size_key}": "{size_val}",\n'
    
    ts_content += '''    },
    lineHeight: {
'''
    
    # Add line heights
    if 'line_height' in style_system.get('typography_scale', {}):
        for i, lh in enumerate(style_system['typography_scale']['line_height']):
            ts_content += f'      lh{i+1}: "{lh}",\n'
    
    ts_content += '''    },
    letterSpacing: {
'''
    
    # Add letter spacing
    if 'letter_spacing' in style_system.get('typography_scale', {}):
        for i, ls in enumerate(style_system['typography_scale']['letter_spacing']):
            ts_content += f'      ls{i+1}: "{ls}",\n'
    
    ts_content += '''    },
  },
  
  spacing: [
'''
    
    # Add spacing scale
    for space in style_system['spacing_scale'][:20]:  # Limit to prevent too many
        ts_content += f'    "{space}",\n'
    
    ts_content += '''  ],
  
  borderRadius: [
'''
    
    # Add border radius
    for br in style_system['border_radius']:
        ts_content += f'    "{br}",\n'
    
    ts_content += '''  ],
  
  shadows: [
'''
    
    # Add shadows
    for shadow in style_system['shadows'][:5]:  # Limit to main shadows
        ts_content += f'    "{shadow}",\n'
    
    ts_content += '''  ],
};

export type DesignTokens = typeof designTokens;
'''
    
    # Save file
    output_path = output_dir / 'design_tokens.ts'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    return output_path

def main():
    print("Starting complete style extraction...")
    
    # Read HTML
    html_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/page.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Create output directory
    output_dir = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/yessine-portfolio/analysis')
    output_dir.mkdir(exist_ok=True)
    
    # Extract complete style system
    print("\n1. Extracting complete style system...")
    style_system = extract_complete_style_system(html_content)
    
    # Save style system
    with open(output_dir / 'complete_style_system.json', 'w') as f:
        json.dump(style_system, f, indent=2, default=str)
    
    print(f"   Colors: {len(style_system['color_palette'])}")
    print(f"   Spacing values: {len(style_system['spacing_scale'])}")
    print(f"   Border radius values: {len(style_system['border_radius'])}")
    print(f"   Shadows: {len(style_system['shadows'])}")
    
    # Extract layout patterns
    print("\n2. Extracting layout patterns...")
    layout_patterns = extract_layout_patterns(html_content)
    
    with open(output_dir / 'layout_patterns.json', 'w') as f:
        json.dump(layout_patterns, f, indent=2, default=str)
    
    print(f"   Flex layouts: {len(layout_patterns['flex_layouts'])}")
    print(f"   Grid layouts: {len(layout_patterns['grid_layouts'])}")
    
    # Generate TypeScript design tokens
    print("\n3. Generating TypeScript design tokens...")
    tokens_path = create_design_tokens_file(style_system, output_dir)
    print(f"   Generated: {tokens_path}")
    
    print("\n" + "="*60)
    print("COMPLETE STYLE EXTRACTION FINISHED!")
    print("="*60)
    print(f"\nFiles generated:")
    print(f"  - complete_style_system.json")
    print(f"  - layout_patterns.json")
    print(f"  - design_tokens.ts")

if __name__ == '__main__':
    main()
