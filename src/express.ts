import express from 'express';

// Create a new express app instance
const app: express.Application = express();

// Environment variables
const { SERVER_APP_PORT } = process.env;

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(SERVER_APP_PORT, () =>
  console.log(
    `Botus is awake and listening at http://localhost:${SERVER_APP_PORT}`,
  ),
);
