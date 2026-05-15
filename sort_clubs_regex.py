import re

file_path = 'clubs.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find each club card block
# Each block starts with <div class="col-sm-12 col-md-6 col-lg-3 mb-4">
# and ends with the 3rd closing </div> (for col, a-wrap, details-wrap)
# Actually, the cards are very consistent.
# They end with </a>\n      </div>
pattern = re.compile(r'(<div class="col-sm-12 col-md-6 col-lg-3 mb-4">.*?</a>\s*</div>)', re.DOTALL)

blocks = pattern.findall(content)

if not blocks:
    print("No blocks found!")
    import sys
    sys.exit(1)

def get_title(block):
    match = re.search(r'data-title="([^"]*)"', block)
    return match.group(1).upper() if match else ""

# Group and sort
sorted_blocks = sorted(blocks, key=get_title)

# Find the total range of blocks in the original file
# We'll replace from the first block to the last block.
first_block = blocks[0]
last_block = blocks[-1]

# We join the sorted blocks
sorted_html = "\n      ".join(sorted_blocks)

# We need to find the start of the first block and end of the last block in the original content
start_idx = content.find(first_block)
end_idx = content.find(last_block) + len(last_block)

new_content = content[:start_idx] + sorted_html + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully sorted {len(blocks)} club cards alphabetically.")
