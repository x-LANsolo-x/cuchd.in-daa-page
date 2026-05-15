import re

file_path = '/home/nocturn/OAA/cuchd.in/clubs.html'

with open(file_path, 'r') as f:
    content = f.read()

def update_members(match):
    members_str = match.group(1)
    if members_str == "" or members_str == "0":
        return 'data-members="100+"'
    try:
        members_val = int(members_str)
        if members_val < 100:
            return 'data-members="100+"'
        else:
            return f'data-members="{members_str}"'
    except ValueError:
        return f'data-members="{members_str}"'

# Regular expression to find data-members="X"
new_content = re.sub(r'data-members="([^"]*)"', update_members, content)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Membership normalization complete.")
