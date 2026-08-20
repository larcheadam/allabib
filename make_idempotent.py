import sys
import re

with open('schema.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Add DROP POLICY IF EXISTS before every CREATE POLICY
def replacer(match):
    policy_name = match.group(1)
    table_name = match.group(2)
    full_stmt = match.group(0)
    return f'DROP POLICY IF EXISTS "{policy_name}" ON {table_name};\n{full_stmt}'

pattern = re.compile(r'CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a_zA_Z0-9_]+)', re.IGNORECASE)
new_sql = pattern.sub(replacer, sql)

with open('schema.sql', 'w', encoding='utf-8') as f:
    f.write(new_sql)

print('Successfully added DROP POLICY IF EXISTS before all policies!')
