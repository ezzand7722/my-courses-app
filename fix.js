const fs = require('fs');
const files = [
  'app/courses/[id]/page.tsx',
  'app/teacher/courses/[id]/edit/page.tsx',
  'app/teachers/[id]/page.tsx'
];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('export const runtime = "edge";\\n\\'use client\\';', 'export const runtime = "edge";\n\\'use client\\';');
    fs.writeFileSync(file, content);
  }
}
