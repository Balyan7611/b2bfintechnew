import os
import json
import re

with open(r'C:\Users\rampr\Downloads\api_collection.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get all valid paths from postman collection
postman_paths = []
for path, methods in data.get('paths', {}).items():
    postman_paths.append(path.lower())

print('--- Checking for mismatches in src/services ---')
for root, dirs, files in os.walk('src/services'):
    for file in files:
        if file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Find all apiService calls
                # regex to find simple static routes: apiService.get('/SomeRoute' or `/SomeRoute`
                matches = re.findall(r"apiService\.(?:get|post|put|delete|patch|postForm|putForm)\([`']([^$?'`]+)", content)
                for route in matches:
                    route_clean = route.strip()
                    # if route ends with a slash or ID placeholder, handle it loosely
                    route_lower = '/api' + route_clean.lower()
                    if route_lower.endswith('/'):
                         route_lower = route_lower[:-1]
                    
                    # See if route_lower matches any postman_path
                    # We can do a substring check or exact check
                    found = False
                    for p in postman_paths:
                        if route_lower == p or p.startswith(route_lower + '/') or route_lower.startswith(p + '/'):
                            found = True
                            break
                        # Handle /{id}
                        if p.endswith('}'):
                            p_base = p[:p.rfind('/')]
                            if route_lower == p_base or route_lower.startswith(p_base + '/'):
                                found = True
                                break
                    if not found:
                        print(f"Mismatch in {file}: {route_clean} (Not found in Postman)")
