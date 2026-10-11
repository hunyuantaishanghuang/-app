#!/usr/bin/env python3
import os
import zipfile

zip_targets = ['public/elderly_health_screening_project.zip', 'elderly_health_screening_project.zip']

include_files = [
    'index.html',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'metadata.json',
    '.env.example',
    '.gitignore',
    'README.md',
    '使用说明_离线运行必读.txt',
    '一键启动_Windows.bat',
    '一键启动_Mac或Linux.sh',
    'screen_elderly_health.py',
    '双击直接离线使用_免安装版.html',
]

include_dirs = ['src', 'public', 'scripts']

# Create temporary zip
temp_zip = 'temp_project.zip'
with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in include_files:
        if os.path.exists(f):
            zf.write(f, f)

    for d in include_dirs:
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.zip'): continue
                filepath = os.path.join(root, file)
                zf.write(filepath, filepath)

for target in zip_targets:
    os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
    with open(temp_zip, 'rb') as f_in, open(target, 'wb') as f_out:
        f_out.write(f_in.read())

if os.path.exists(temp_zip):
    os.remove(temp_zip)

print("Successfully packaged project zip! Size:", os.path.getsize(zip_targets[0]), "bytes")
