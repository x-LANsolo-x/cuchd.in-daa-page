import re

with open('clubs.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. More aggressive Modal Stability
content = re.sub(
    r'#clubCarousel \{.*?\}',
    '#clubCarousel { aspect-ratio: 16 / 10; background-color: #000; display: flex; align-items: center; overflow: hidden; }',
    content, flags=re.DOTALL
)

# Ensure carousel item takes full height of the fixed aspect-ratio container
content = re.sub(
    r'#clubCarousel \.carousel-item \{.*?\}',
    '#clubCarousel .carousel-item { height: 100%; width: 100%; }',
    content, flags=re.DOTALL
)

# Ensure images cover the area without distorting or causing jumps
content = re.sub(
    r'#clubCarousel \.carousel-item img \{.*?\}',
    '#clubCarousel .carousel-item img { width: 100%; height: 100%; object-fit: cover; }',
    content, flags=re.DOTALL
)

# 2. Card Height Stability
# We set a fixed height for the figure to prevent grid jumping
content = re.sub(
    r'\.pxp-areas-1-item-fig \{.*?\}',
    '.pxp-areas-1-item-fig { aspect-ratio: 16 / 11; width: 100%; height: auto; min-height: 220px; object-fit: cover; background-color: #f0f0f0; }',
    content, flags=re.DOTALL
)

# 3. Prevent automatic AOS shifts
content = content.replace('aos-init', '')
content = content.replace('aos-animate', '')

with open('clubs.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Final stability fixes applied.")
