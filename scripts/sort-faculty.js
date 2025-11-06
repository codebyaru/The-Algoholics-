const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const facultyPath = path.join(projectRoot, 'faculty.json');
const backupPath = path.join(projectRoot, 'faculty.json.bak');

if (!fs.existsSync(facultyPath)) {
  console.error('faculty.json not found at', facultyPath);
  process.exit(1);
}

try {
  const raw = fs.readFileSync(facultyPath, 'utf8');
  // create a backup
  fs.writeFileSync(backupPath, raw, 'utf8');

  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Unexpected JSON format: expected an array');
    process.exit(1);
  }

  data.sort((a, b) => {
    const na = (a.name || '').toString().toLowerCase();
    const nb = (b.name || '').toString().toLowerCase();
    return na.localeCompare(nb);
  });

  fs.writeFileSync(facultyPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Sorted ${data.length} entries and wrote backup to ${backupPath}`);
} catch (err) {
  console.error('Error while sorting faculty.json:', err);
  process.exit(1);
}
