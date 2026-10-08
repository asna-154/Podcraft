const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { trim, mongoId } = require('./helpers');

const NICHES = [
  'Technology', 'Business & Entrepreneurship', 'Health & Wellness',
  'True Crime', 'Education', 'Entertainment', 'Sports',
  'Politics & News', 'Science', 'Personal Development',
  'Finance', 'Arts & Culture', 'History', 'Comedy',
  'Religion & Spirituality', 'Society & Culture',
  'Kids & Family', 'Music', 'Travel', 'Food',
];

// userId is added automatically by the association in models/index.js.
// Guests are no longer embedded: they live in their own table (models/Guest.js).
// bookmarkedTopics is a many-to-many link, also set up in models/index.js.
const Episode = sequelize.define(
  'Episode',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: mongoId(),
    podcastNiche: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'Podcast niche is required' },
        isIn: { args: [NICHES], msg: 'Invalid podcast niche' },
      },
    },
    episodeTopic: {
      type: DataTypes.STRING(200),
      allowNull: false,
      set: trim('episodeTopic'),
      validate: {
        notNull: { msg: 'Episode topic is required' },
        notEmpty: { msg: 'Episode topic is required' },
        len: { args: [1, 200], msg: 'Topic cannot exceed 200 characters' },
      },
    },
    tone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Professional',
      validate: { isIn: { args: [['Casual', 'Professional', 'Humorous', 'Serious']], msg: 'Invalid tone' } },
    },
    episodeDuration: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 60 },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: { isIn: { args: [['draft', 'research', 'planning', 'complete']], msg: 'Invalid status' } },
    },
    researchStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: { args: [['pending', 'processing', 'complete', 'failed']], msg: 'Invalid research status' } },
    },
  },
  { tableName: 'episodes', timestamps: true }
);

module.exports = Episode;
