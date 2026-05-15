from bs4 import BeautifulSoup
import sys

file_path = 'clubs.html'
with open(file_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# Find all club cards
# They are inside <div class="col-sm-12 col-md-6 col-lg-3 mb-4">
cards = soup.find_all('div', class_='col-sm-12 col-md-6 col-lg-3 mb-4')

if not cards:
    print("No cards found!")
    sys.exit(1)

# Sort cards by data-title attribute of the <a> tag inside them
def get_title(card):
    a_tag = card.find('a', class_='pxp-areas-1-item')
    if a_tag and a_tag.has_attr('data-title'):
        return a_tag['data-title'].strip().upper()
    return ""

sorted_cards = sorted(cards, key=get_title)

# Find the container of the cards (the parent row)
container = cards[0].parent

# Clear the container and append sorted cards
for card in cards:
    card.decompose()

for card in sorted_cards:
    container.append(card)

# Save the updated HTML
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(soup.prettify())

print(f"Successfully sorted {len(sorted_cards)} clubs alphabetically.")
