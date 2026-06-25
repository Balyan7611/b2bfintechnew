import json
import sys

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('--- Endpoints with Pagination ---')
for path, methods in data.get('paths', {}).items():
    for method, details in methods.items():
        params = details.get('parameters', [])
        param_names = [p.get('name') for p in params]
        if 'PageNumber' in param_names or 'PageSize' in param_names:
            print(f'{method.upper()} {path}')
            print(f'  Params: {", ".join(param_names)}')
