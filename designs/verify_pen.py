import json
with open('C:/Garagem/Escritorios/PrecoReal/designs/precoreal.pen', 'r', encoding='utf-8') as f:
    data = json.load(f)
frames = [c.get('name') for c in data['children']]
print('Top-level frames:', frames)
for frame in data['children']:
    name = frame.get('name', '?')
    kids = frame.get('children', [])
    reusable = [c.get('name','?') for c in kids if c.get('reusable')]
    print(f'  {name}: {len(kids)} children, {len(reusable)} reusable')
    if reusable:
        for r in reusable[:5]:
            print(f'    - {r}')
        if len(reusable) > 5:
            print(f'    ... and {len(reusable)-5} more')
