import sys

file_path = r'c:\Users\pakyv\Desktop\pff-website-master\src\app\turnieje\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# lines[1071] is line 1072
# lines[1538] is line 1539

new_lines = lines[:1071] + ["          ) : (\n"] + lines[1539:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
