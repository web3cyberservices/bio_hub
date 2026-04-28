import os

path = 'src/app/dashboard/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = ["'use client';\n", "import { Suspense } from 'react';\n"]
old_body = []
imports = []

for line in lines:
    if line.startswith("'use client'") or "from 'react'" in line:
        continue
    if line.startswith("import"):
        imports.append(line)
    else:
        old_body.append(line)

final_code = ["'use client';\n", "import { Suspense } from 'react';\n"] + imports
final_code.append("\nfunction DashboardContent() {\n")
# Очищаем старый export default, чтобы не дублировать
body_text = "".join(old_body).replace("export default function DashboardPage", "function OldDashboard")
final_code.append(body_text)
final_code.append("\n}\n\n")
final_code.append("export default function DashboardPage() {\n")
final_code.append("  return (\n    <Suspense fallback={<div className='p-10 text-center'>Загрузка Bio-Hub...</div>}>\n")
final_code.append("      <DashboardContent />\n    </Suspense>\n  );\n}\n")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(final_code)
