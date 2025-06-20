const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', contactRoutes);

// Database connection and server start
sequelize.sync({ force: false }).then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;