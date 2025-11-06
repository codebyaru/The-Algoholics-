const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// API endpoint to serve faculty data
app.get('/api/faculty', (req, res) => {
  fs.readFile('faculty.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading faculty.json:', err);
      res.status(500).json({ error: 'Failed to load faculty data' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📂 Open your browser and visit: http://localhost:${PORT}`);
});