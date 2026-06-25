import json

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('--- Member Endpoints ---')
for path, methods in data.get('paths', {}).items():
    if '/api/Member/' in path:
        for method, details in methods.items():
            print(f'{method.upper()} {path}')
