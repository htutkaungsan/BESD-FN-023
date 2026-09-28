require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
// The exam specifies /user; the integration-test table also uses /users.
app.use('/user', userRoutes);
app.use('/users', userRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`BESD-FN-023 API listening on port ${port}`));
}

module.exports = app;
