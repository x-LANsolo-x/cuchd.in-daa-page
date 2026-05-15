import re

files = ['clubs.html']

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update the CSS block for stability
    css_updates = """
        /* Layout Stability Fixes */
        .pxp-areas-1-item {
            /* Remove content-visibility to prevent scroll jumps */
            content-visibility: visible !important;
            contain-intrinsic-size: auto !important;
        }
        .pxp-areas-1-item-fig {
            will-change: auto !important;
            transition: none !important; /* Disable transitions for initial stability */
            aspect-ratio: 16 / 10;
            height: auto !important;
            min-height: 200px;
        }
        #clubCarousel {
            aspect-ratio: 16 / 10;
            background-color: #f8f9fa;
        }
        #clubCarousel .carousel-item {
            aspect-ratio: 16 / 10;
        }
        #clubCarousel .carousel-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        /* Prevent modal from being too tall */
        #clubModal .modal-content {
            max-height: 95vh;
            overflow: hidden;
        }
        #clubModal .modal-body {
            max-height: 95vh;
            overflow-y: auto;
        }
    """
    
    # Prepend to the first <style> tag or inside the existing one
    content = content.replace('/* Performance optimizations */', css_updates)

    # 2. Disable AOS on club cards to prevent late-loading shifts
    # Replace data-aos="fade-up" or similar if any
    content = content.replace('data-aos="fade-up"', '')
    content = content.replace('data-aos="fade"', '')
    
    # 3. Fix the modal row to be more stable
    content = content.replace('min-height: 500px;', 'min-height: 500px; align-items: stretch;')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Layout stability fixes applied.")
