const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    field: 'phone_number', // Maps to phone_number column
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  linkedId: {
    type: DataTypes.INTEGER,
    field: 'linked_id', // Maps to linked_id column
    allowNull: true
  },
  linkPrecedence: {
    type: DataTypes.ENUM('primary', 'secondary'),
    field: 'link_precedence', // Maps to link_precedence column
    defaultValue: 'primary'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at', // Maps to created_at column
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at', // Maps to updated_at column
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deleted_at', // Maps to deleted_at column
    allowNull: true
  }
}, {
  tableName: 'contacts',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['phone_number']
    }, 
    {
      fields: ['email']
    },
    {
      fields: ['linked_id']
    },
    {
      fields: ['link_precedence'],
      where: {
        link_precedence: 'primary'
      }
    }
  ]
});

module.exports = Contact;
