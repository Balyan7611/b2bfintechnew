import json

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('--- Paths related to KYC ---')
for path, methods in data.get('paths', {}).items():
    if 'kyc' in path.lower():
        print(path)
