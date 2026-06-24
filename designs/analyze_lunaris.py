import json

with open('C:/Users/Jean/.pencil/documents/a05f66a3-bad8-44d3-b1b0-3f4bb8d375da/pencil-lunaris.pen', 'r', encoding='utf-8') as f:
    data = json.load(f)

main_frame = data['children'][0]
reusables = [c for c in main_frame['children'] if c.get('reusable')]
print(f'Total children: {len(main_frame["children"])}')
print(f'Reusable components: {len(reusables)}')
for r in reusables:
    print(f'  - {r.get("name", "unnamed")}')

print()

# Show component names with types
for r in reusables:
    rtype = r.get('type', '?')
    rid = r.get('id', '?')
    rname = r.get('name', 'unnamed')
    print(f'{rid:12s} {rtype:8s} {rname}')
