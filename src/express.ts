import express from 'express';
import { SERVER_APP_PORT } from './environment';

// Create a new express app instance
const app: express.Application = express();

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(SERVER_APP_PORT, () =>
  console.log(
    `Botus is awake and listening at http://localhost:${SERVER_APP_PORT}`,
  ),
);
