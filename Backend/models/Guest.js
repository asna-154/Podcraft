const { DataTypes, ValidationError } = require('sequelize');
const sequelize = require('../config/database');
const { trim, mongoId } = require('./helpers');

// Replaces the guestSchema that was embedded inside Episode.
// episodeId is added automatically by the association in models/index.js.
const Guest = sequelize.define(
  'Guest',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: mongoId(),
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set: trim('name'),
      validate: { notNull: { msg: 'Guest name is required' }, notEmpty: { msg: 'Guest name is required' } },
    },
    profession: { type: DataTypes.STRING, set: trim('profession') },
    url: { type: DataTypes.TEXT, set: trim('url') },
    bio: { type: DataTypes.TEXT, set: trim('bio') },
    generatedSummary: { type: DataTypes.TEXT, set: trim('generatedSummary') },
  },
  { tableName: 'guests', timestamps: false }
);

// Same rule as before: maximum 3 guests per episode.
Guest.beforeCreate(async (guest, options) => {
  const count = await Guest.count({
    where: { episodeId: guest.episodeId },
    transaction: options.transaction,
  });
  if (count >= 3) {
    throw new ValidationError('Maximum 3 guests allowed per episode');
  }
});

module.exports = Guest;
