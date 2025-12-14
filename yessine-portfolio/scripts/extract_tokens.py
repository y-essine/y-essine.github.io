# Extract CSS Variables and Computed Styles
# Comprehensive extraction of all design tokens from Framer HTML

import re
import json
from pathlib import Path
from collections import defaultdict

def extract_css_variables_from_html(html_content):
    """Extract all CSS variable definitions"""
    
    variables = {}
    
    # Extract from <style> tags
    style_tag_pattern = r'<style[^>]*>(.*?)</style>'
    style_tags = re.findall(style_tag_pattern, html_content, re.DOTALL)
    
    for style_content in style_tags:
        # Find all CSS variable definitions
        var_pattern = r'--([^:]+):\s*([^;]+);'
        matches = re.findall(var_pattern, style_content)
        
        for var_name, value in matches:
            variables[var_name.strip()] = value.strip()
    
    # Also check for inline CSS variable definitions in style attributes
    inline_var_pattern = r'style="[^"]*--([^:]+):\s*([^;"]+)'
    inline_matches = re.findall(inline_var_pattern, html_content)
    
    for var_name, value in inline_matches:
        var_name = var_name.strip()
        value = value.strip()
        if var_name not in variables:
            variables[var_name] = value
    
    return variables

def extract_token_references(html_content):
    """Extract all token references (--token-xxx)"""
    
    token_pattern = r'var\(--token-([^,)]+)(?:,\s*([^)]+))?\)'
    matches = re.findall(token_pattern, html_content)
    
    tokens = {}
    for token_id, fallback in matches:
        token_id = token_id.strip()
        fallback = fallback.strip() if fallback else None
        
        if token_id not in tokens:
            tokens[token_id] = {
                'id': token_id,
                'fallback': fallback,
                'usage_count': 1
            }
        else:
            tokens[token_id]['usage_count'] += 1
    
    return tokens

def extract_all_colors(html_content):
    """Extract all color values from the HTML"""
    
    colors = {
        'rgb': set(),
        'rgba': set(),
        'hex': set(),
        'named': set()
    }
    
    # RGB colors
    rgb_pattern = r'rgb\((\d+),\s*(\d+),\s*(\d+)\)'
    rgb_matches = re.findall(rgb_pattern, html_content)
    for r, g, b in rgb_matches:
        colors['rgb'].add(f'rgb({r}, {g}, {b})')
    
    # RGBA colors
    rgba_pattern = r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)'
    rgba_matches = re.findall(rgba_pattern, html_content)
    for r, g, b, a in rgba_matches:
        colors['rgba'].add(f'rgba({r}, {g}, {b}, {a})')
    
    # Hex colors
    hex_pattern = r'#([0-9a-fA-F]{3,6})\b'
    hex_matches = re.findall(hex_pattern, html_content)
    for hex_color in hex_matches:
        colors['hex'].add(f'#{hex_color}')
    
    return {
        'rgb': sorted(list(colors['rgb'])),
        'rgba': sorted(list(colors['rgba'])),
        'hex': sorted(list(colors['hex']))
    }

def extract_typography_system(html_content):
    """Extract complete typography system"""
    
    typography = {
        'font_sizes': {},
        'font_weights': set(),
        'line_heights': set(),
        'letter_spacings': set(),
        'font_families': set()
    }
    
    # Font size with context
    font_size_pattern = r'font-size:\s*([^;]+);'
    matches = re.findall(font_size_pattern, html_content)
    for size in matches:
        size = size.strip()
        if size not in typography['font_sizes']:
            typography['font_sizes'][size] = 0
        typography['font_sizes'][size] += 1
    
    # Font weight
    weight_pattern = r'font-weight:\s*([^;]+);'
    typography['font_weights'].update(re.findall(weight_pattern, html_content))
    
    # Line height
    lh_pattern = r'line-height:\s*([^;]+);'
    typography['line_heights'].update(re.findall(lh_pattern, html_content))
    
    # Letter spacing
    ls_pattern = r'letter-spacing:\s*([^;]+);'
    typography['letter_spacings'].update(re.findall(ls_pattern, html_content))
    
    # Font family
    ff_pattern = r'font-family:\s*([^;]+);'
    typography['font_families'].update(re.findall(ff_pattern, html_content))
    
    # Convert sets to sorted lists
    typography['font_weights'] = sorted(list(typography['font_weights']))
    typography['line_heights'] = sorted(list(typography['line_heights']))
    typography['letter_spacings'] = sorted(list(typography['letter_spacings']))
    typography['font_families'] = list(typography['font_families'])
    
    # Sort font sizes by frequency
    typography['font_sizes'] = dict(sorted(
        typography['font_sizes'].items(),
        key=lambda x: x[1],
        reverse=True
    ))
    
    return typography

def extract_spacing_system(html_content):
    """Extract spacing values (margin, padding, gap)"""
    
    spacing = {
        'margin': set(),
        'padding': set(),
        'gap': set()
    }
    
    # All spacing patterns
    patterns = {
        'margin': [
            r'margin:\s*([^;]+);',
            r'margin-top:\s*([^;]+);',
            r'margin-bottom:\s*([^;]+);',
            r'margin-left:\s*([^;]+);',
            r'margin-right:\s*([^;]+);'
        ],
        'padding': [
            r'padding:\s*([^;]+);',
            r'padding-top:\s*([^;]+);',
            r'padding-bottom:\s*([^;]+);',
            r'padding-left:\s*([^;]+);',
            r'padding-right:\s*([^;]+);'
        ],
        'gap': [
            r'gap:\s*([^;]+);',
            r'row-gap:\s*([^;]+);',
            r'column-gap:\s*([^;]+);'
        ]
    }
    
    for category, pattern_list in patterns.items():
        for pattern in pattern_list:
            matches = re.findall(pattern, html_content)
            spacing[category].update(matches)
    
    # Convert to sorted lists
    return {
        'margin': sorted(list(spacing['margin'])),
        'padding': sorted(list(spacing['padding'])),
        'gap': sorted(list(spacing['gap']))
    }

def extract_dimensions(html_content):
    """Extract width and height values"""
    
    dimensions = {
        'widths': set(),
        'heights': set(),
        'max_widths': set(),
        'min_heights': set()
    }
    
    patterns = {
        'widths': r'width:\s*([^;]+);',
        'heights': r'height:\s*([^;]+);',
        'max_widths': r'max-width:\s*([^;]+);',
        'min_heights': r'min-height:\s*([^;]+);'
    }
    
    for key, pattern in patterns.items():
        matches = re.findall(pattern, html_content)
        dimensions[key].update(matches)
    
    return {k: sorted(list(v)) for k, v in dimensions.items()}

def extract_border_styles(html_content):
    """Extract border-related styles"""
    
    borders = {
        'border_radius': set(),
        'border_widths': set(),
        'border_colors': set(),
        'border_styles': set()
    }
    
    # Border radius
    br_patterns = [
        r'border-radius:\s*([^;]+);',
        r'border-top-left-radius:\s*([^;]+);',
        r'border-top-right-radius:\s*([^;]+);',
        r'border-bottom-left-radius:\s*([^;]+);',
        r'border-bottom-right-radius:\s*([^;]+);'
    ]
    for pattern in br_patterns:
        borders['border_radius'].update(re.findall(pattern, html_content))
    
    # Border width
    bw_pattern = r'border-width:\s*([^;]+);'
    borders['border_widths'].update(re.findall(bw_pattern, html_content))
    
    # Border color
    bc_pattern = r'border-color:\s*([^;]+);'
    borders['border_colors'].update(re.findall(bc_pattern, html_content))
    
    # Border style
    bs_pattern = r'border-style:\s*([^;]+);'
    borders['border_styles'].update(re.findall(bs_pattern, html_content))
    
    return {k: sorted(list(v)) for k, v in borders.items()}

def extract_effects(html_content):
    """Extract visual effects (shadows, filters, opacity)"""
    
    effects = {
        'box_shadows': set(),
        'text_shadows': set(),
        'filters': set(),
        'backdrop_filters': set(),
        'opacities': set(),
        'transforms': set()
    }
    
    patterns = {
        'box_shadows': r'box-shadow:\s*([^;]+);',
        'text_shadows': r'text-shadow:\s*([^;]+);',
        'filters': r'filter:\s*([^;]+);',
        'backdrop_filters': r'backdrop-filter:\s*([^;]+);',
        'opacities': r'opacity:\s*([^;]+);',
        'transforms': r'transform:\s*([^;]+);'
    }
    
    for key, pattern in patterns.items():
        matches = re.findall(pattern, html_content)
        effects[key].update(matches)
    
    return {k: sorted(list(v)) for k, v in effects.items()}

def create_comprehensive_tokens_file(all_data, output_dir):
    """Create a comprehensive TypeScript tokens file"""
    
    ts_content = '''// Comprehensive Design Tokens
// Extracted from Framer HTML - Complete System

export const tokens = {
  // CSS Variables
  cssVariables: {
'''
    
    # Add CSS variables
    for var_name, value in list(all_data['css_variables'].items())[:50]:
        safe_name = var_name.replace('-', '_')
        ts_content += f'    {safe_name}: "{value}",\n'
    
    ts_content += '''  },

  // Color System
  colors: {
    // RGB Colors
    rgb: [
'''
    
    for color in all_data['colors']['rgb'][:30]:
        ts_content += f'      "{color}",\n'
    
    ts_content += '''    ],
    // RGBA Colors
    rgba: [
'''
    
    for color in all_data['colors']['rgba'][:20]:
        ts_content += f'      "{color}",\n'
    
    ts_content += '''    ],
  },

  // Typography System
  typography: {
    fontSizes: [
'''
    
    for size in list(all_data['typography']['font_sizes'].keys())[:20]:
        ts_content += f'      "{size}",\n'
    
    ts_content += '''    ],
    fontWeights: [
'''
    
    for weight in all_data['typography']['font_weights']:
        ts_content += f'      "{weight}",\n'
    
    ts_content += '''    ],
    lineHeights: [
'''
    
    for lh in all_data['typography']['line_heights'][:20]:
        ts_content += f'      "{lh}",\n'
    
    ts_content += '''    ],
    letterSpacings: [
'''
    
    for ls in all_data['typography']['letter_spacings'][:10]:
        ts_content += f'      "{ls}",\n'
    
    ts_content += '''    ],
    fontFamilies: [
'''
    
    for ff in all_data['typography']['font_families']:
        ts_content += f'      "{ff}",\n'
    
    ts_content += '''    ],
  },

  // Spacing System
  spacing: {
    margin: [
'''
    
    for m in all_data['spacing']['margin'][:20]:
        ts_content += f'      "{m}",\n'
    
    ts_content += '''    ],
    padding: [
'''
    
    for p in all_data['spacing']['padding'][:20]:
        ts_content += f'      "{p}",\n'
    
    ts_content += '''    ],
    gap: [
'''
    
    for g in all_data['spacing']['gap'][:15]:
        ts_content += f'      "{g}",\n'
    
    ts_content += '''    ],
  },

  // Border System
  borders: {
    radius: [
'''
    
    for br in all_data['borders']['border_radius'][:15]:
        ts_content += f'      "{br}",\n'
    
    ts_content += '''    ],
  },

  // Effects
  effects: {
    boxShadows: [
'''
    
    for shadow in all_data['effects']['box_shadows'][:5]:
        escaped_shadow = shadow.replace('"', '\\"')
        ts_content += f'      "{escaped_shadow}",\n'
    
    ts_content += '''    ],
    backdropFilters: [
'''
    
    for filter in all_data['effects']['backdrop_filters'][:5]:
        ts_content += f'      "{filter}",\n'
    
    ts_content += '''    ],
  },
} as const;

export type Tokens = typeof tokens;
'''
    
    output_path = output_dir / 'tokens.ts'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    return output_path

def main():
    print("Starting comprehensive token extraction...")
    print("="*60)
    
    # Read HTML
    html_path = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/page.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Create output directory
    output_dir = Path('c:/Users/mahdi/Documents/-gits/y-essine.github.io/yessine-portfolio/analysis')
    output_dir.mkdir(exist_ok=True)
    
    all_data = {}
    
    # 1. CSS Variables
    print("\n1. Extracting CSS Variables...")
    all_data['css_variables'] = extract_css_variables_from_html(html_content)
    print(f"   Found {len(all_data['css_variables'])} CSS variables")
    
    # 2. Token References
    print("\n2. Extracting Token References...")
    all_data['tokens'] = extract_token_references(html_content)
    print(f"   Found {len(all_data['tokens'])} unique tokens")
    
    # 3. Colors
    print("\n3. Extracting Colors...")
    all_data['colors'] = extract_all_colors(html_content)
    print(f"   RGB: {len(all_data['colors']['rgb'])}")
    print(f"   RGBA: {len(all_data['colors']['rgba'])}")
    print(f"   Hex: {len(all_data['colors']['hex'])}")
    
    # 4. Typography
    print("\n4. Extracting Typography System...")
    all_data['typography'] = extract_typography_system(html_content)
    print(f"   Font sizes: {len(all_data['typography']['font_sizes'])}")
    print(f"   Font weights: {len(all_data['typography']['font_weights'])}")
    print(f"   Line heights: {len(all_data['typography']['line_heights'])}")
    print(f"   Letter spacings: {len(all_data['typography']['letter_spacings'])}")
    
    # 5. Spacing
    print("\n5. Extracting Spacing System...")
    all_data['spacing'] = extract_spacing_system(html_content)
    print(f"   Margin values: {len(all_data['spacing']['margin'])}")
    print(f"   Padding values: {len(all_data['spacing']['padding'])}")
    print(f"   Gap values: {len(all_data['spacing']['gap'])}")
    
    # 6. Dimensions
    print("\n6. Extracting Dimensions...")
    all_data['dimensions'] = extract_dimensions(html_content)
    print(f"   Widths: {len(all_data['dimensions']['widths'])}")
    print(f"   Heights: {len(all_data['dimensions']['heights'])}")
    
    # 7. Borders
    print("\n7. Extracting Border Styles...")
    all_data['borders'] = extract_border_styles(html_content)
    print(f"   Border radius: {len(all_data['borders']['border_radius'])}")
    
    # 8. Effects
    print("\n8. Extracting Visual Effects...")
    all_data['effects'] = extract_effects(html_content)
    print(f"   Box shadows: {len(all_data['effects']['box_shadows'])}")
    print(f"   Backdrop filters: {len(all_data['effects']['backdrop_filters'])}")
    print(f"   Transforms: {len(all_data['effects']['transforms'])}")
    
    # Save all data
    print("\n9. Saving extraction results...")
    
    # Convert sets to lists for JSON serialization
    def convert_sets(obj):
        if isinstance(obj, set):
            return sorted(list(obj))
        elif isinstance(obj, dict):
            return {k: convert_sets(v) for k, v in obj.items()}
        return obj
    
    all_data_serializable = convert_sets(all_data)
    
    with open(output_dir / 'comprehensive_tokens.json', 'w', encoding='utf-8') as f:
        json.dump(all_data_serializable, f, indent=2)
    
    # Create TypeScript tokens file
    print("\n10. Generating TypeScript tokens file...")
    tokens_path = create_comprehensive_tokens_file(all_data, output_dir)
    print(f"    Generated: {tokens_path}")
    
    # Create summary report
    summary = {
        'extraction_date': 'auto-generated',
        'source_file': 'page.html',
        'totals': {
            'css_variables': len(all_data['css_variables']),
            'tokens': len(all_data['tokens']),
            'rgb_colors': len(all_data['colors']['rgb']),
            'rgba_colors': len(all_data['colors']['rgba']),
            'font_sizes': len(all_data['typography']['font_sizes']),
            'spacing_values': len(all_data['spacing']['margin']) + len(all_data['spacing']['padding']) + len(all_data['spacing']['gap']),
            'box_shadows': len(all_data['effects']['box_shadows'])
        }
    }
    
    with open(output_dir / 'extraction_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print("\n" + "="*60)
    print("COMPREHENSIVE EXTRACTION COMPLETE!")
    print("="*60)
    print(f"\n📊 Summary:")
    for key, value in summary['totals'].items():
        print(f"   {key}: {value}")
    
    print(f"\n📁 Files generated:")
    print(f"   - comprehensive_tokens.json (all extracted data)")
    print(f"   - tokens.ts (TypeScript design tokens)")
    print(f"   - extraction_summary.json (summary report)")
    
    print(f"\n✅ Ready for implementation!")

if __name__ == '__main__':
    main()
