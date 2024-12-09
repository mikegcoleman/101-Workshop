const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');

// Read the password from the secret file
let dbPassword;
try {
  dbPassword = fs.readFileSync('/run/secrets/db-password', 'utf8').trim();
} catch (err) {
  console.error('Error: Failed to read the database password from /run/secrets/db-password');
  process.exit(1); // Exit with code 1 if the password cannot be read
}

// Database connection configuration
const dbConfig = {
  host: 'db',          // Hardcoded host
  port: 5432,          // Default PostgreSQL port
  user: 'postgres',    // Hardcoded user
  password: dbPassword, // Password from secret file
  database: 'example' // Database name
};

// Initialize the PostgreSQL connection pool
const pool = new Pool(dbConfig);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database and create table if it doesn't exist
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();

    // Check if the guestbook table exists
    const tableExistsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'guestbook'
      );
    `);

    const tableExists = tableExistsResult.rows[0].exists;

    if (!tableExists) {
      console.log('Initializing database...');
      
      // Create guestbook table
      await client.query(`
        CREATE TABLE guestbook (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          message TEXT NOT NULL
        );
      `);

      console.log('Database initialized with guestbook table.');
    } else {
      console.log('Guestbook table already exists. No initialization needed.');
    }

    client.release();
  } catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1); // Exit with code 1 if database initialization fails
  }
};

// API routes
app.get('/api/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guestbook ORDER BY id ASC');

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Database connection was successful, but no records were found.",
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching guestbook entries:', err.message);
    res.status(500).json({ error: 'Failed to fetch guestbook entries' });
  }
});

app.post('/api/entries', async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO guestbook (name, message) VALUES ($1, $2) RETURNING *',
      [name, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding guestbook entry:', err.message);
    res.status(500).json({ error: 'Failed to add guestbook entry' });
  }
});

// Start the server after initializing the database
const PORT = process.env.PORT || 5000;
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to start the server:', err.message);
    process.exit(1); // Exit with code 1 if initialization fails
  });
