const fs = require('fs');
const files = [
  'app/why-choose-us/page.tsx', 
  'app/doctor-profile/page.tsx', 
  'app/treatments/page.tsx'
];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/href=\"\/chat\"/g, 'href="/profile"');
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed live chat links successfully.');
