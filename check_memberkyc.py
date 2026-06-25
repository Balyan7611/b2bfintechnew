import json

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

for path, methods in data.get('paths', {}).items():
    if '/MemberKYCDocuments/get-all' in path:
        for method, details in methods.items():
            print(f'{method.upper()} {path}')
            for p in details.get('parameters', []):
                print(f"  {p.get('name')} ({p.get('in')}): {p.get('schema', {})}")
