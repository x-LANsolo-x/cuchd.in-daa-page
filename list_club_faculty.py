from bs4 import BeautifulSoup

with open('clubs.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

cards = soup.find_all('a', {'data-bs-toggle': 'modal'})
print(f"| {'Club Name':<30} | {'Faculty Champion':<30} |")
print(f"|{'-'*32}|{'-'*32}|")
for card in cards:
    title = card.get('data-title', 'N/A').strip()
    faculty = card.get('data-faculty', 'Not Assigned').strip()
    if title != 'N/A':
        print(f"| {title:<30} | {faculty:<30} |")

