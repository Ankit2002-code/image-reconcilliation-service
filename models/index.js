const { Sequelize, DataTypes, Op } = require('sequelize');  // Make sure Op is imported
const sequelize = require('../config/db');
const Contact = require('./contact');

const models = {
  Contact,
};

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
