const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let guestbookEntries = [
  {
    id: 1,
    name: "Alice",
    message: "This is a wonderful guestbook!",
  },
  {
    id: 2,
    name: "Bob",
    message: "Hello, everyone! Great to be here.",
  },
  {
    id: 3,
    name: "Charlie",
    message: "Keep up the great work!",
  },
];

app.get('/api/entries', (req, res) => {
  res.json(guestbookEntries);
});

app.post('/api/entries', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }
  const entry = { id: guestbookEntries.length + 1, name, message };
  guestbookEntries.push(entry);
  res.status(201).json(entry);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
