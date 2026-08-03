const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'app', 'admin', 'dashboard', 'page.tsx');
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Find old certificates tab start (line 844) and old announcements tab end (line 988)
// We need to remove lines 844-988 (0-indexed: 843-987)
let startRemove = -1;
let endRemove = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('6. CERTIFICATES VERIFICATION TAB')) {
    startRemove = i;
  }
  if (startRemove !== -1 && lines[i].includes('7. AI CONFIGURATION TAB')) {
    endRemove = i;
    break;
  }
}

if (startRemove !== -1 && endRemove !== -1) {
  console.log(`Removing lines ${startRemove + 1} to ${endRemove} (0-indexed: ${startRemove} to ${endRemove - 1})`);
  const newLines = [...lines.slice(0, startRemove), ...lines.slice(endRemove)];
  fs.writeFileSync(file, newLines.join('\n'), 'utf8');
  console.log('Successfully removed old certificates/complaints/announcements tabs.');
} else {
  console.error('Could not find section boundaries.', { startRemove, endRemove });
}
