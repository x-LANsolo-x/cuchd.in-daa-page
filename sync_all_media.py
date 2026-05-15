import os
import re

file_path = 'clubs.html'
media_root = 'media'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Get all folders in media/
folders = [f for f in os.listdir(media_root) if os.path.isdir(os.path.join(media_root, f))]

# Pattern to find all club cards
# <a ... data-media="..." ... data-title="..." ...>
club_pattern = re.compile(r'(<a class="pxp-areas-1-item rounded-lg".*?>)', re.DOTALL)
cards = club_pattern.findall(content)

updated_content = content

for card in cards:
    # 1. Get the title for logging/mapping
    title_match = re.search(r'data-title="([^"]*)"', card)
    title = title_match.group(1) if title_match else "Unknown"
    
    # 2. Find which media folder this club currently uses
    # We look for "media/FOLDER_NAME/" in data-media or data-img
    media_match = re.search(r'data-media="media/([^/]+)/', card)
    if not media_match:
        media_match = re.search(r'data-img="logos/([^"]*)"', card) # Sometimes logo helps
        
    if media_match:
        folder_name = media_match.group(1)
        # If it was a logo, it might not be a folder. Let's check folders list.
        potential_folder = folder_name.strip()
        if potential_folder not in folders:
            # Try to match by title
            clean_title = title.lower().replace(" club", "").strip()
            for f in folders:
                if clean_title in f.lower():
                    potential_folder = f
                    break
        
        if potential_folder in folders:
            folder_path = os.path.join(media_root, potential_folder)
            files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            
            if files:
                new_media_list = ",".join([f"media/{potential_folder}/{file}" for file in files])
                
                # Update the data-media in this card
                new_card = re.sub(r'data-media="[^"]*"', f'data-media="{new_media_list}"', card)
                updated_content = updated_content.replace(card, new_card)
                print(f"Synced {len(files)} images for {title} from folder: {potential_folder}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Global Media Sync Complete.")
