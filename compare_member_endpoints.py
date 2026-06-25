import json

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

for path in ['/api/Member/get-all-members', '/api/Member/MemberSearch']:
    methods = data.get('paths', {}).get(path, {})
    for method, details in methods.items():
        print(f'{method.upper()} {path}')
        params = details.get('parameters', [])
        for p in params:
             print(f"  Param: {p.get('name')}")
        if 'requestBody' in details:
             print('  Has Request Body')
