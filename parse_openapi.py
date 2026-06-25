import json
import sys

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('--- MemberKYCDocuments Endpoints ---')
for path, methods in data.get('paths', {}).items():
    if 'MemberKYCDocuments' in path:
        for method, details in methods.items():
            print(f'\nEndpoint: {method.upper()} {path}')
            params = details.get('parameters', [])
            if params:
                print('  Parameters:')
                for p in params:
                    print(f"    - {p.get('name')} (in: {p.get('in')})")
            request_body = details.get('requestBody')
            if request_body:
                print('  Has Request Body')
