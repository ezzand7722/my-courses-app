const fs = require('fs');
const files = [
  'app/courses/[id]/page.tsx',
  'app/teacher/courses/[id]/edit/page.tsx',
  'app/teachers/[id]/page.tsx',
  'middleware.ts'
];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('runtime')) {
      content = 'export const runtime = "edge";\\n' + content;
      fs.writeFileSync(file, content);
      console.log('Added to ' + file);
    }
  }
}
