const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { trim, mongoId } = require('./helpers');

const required = (label) => ({
  notNull: { msg: `${label} is required` },
  notEmpty: { msg: `${label} is required` },
});

// episodeId and userId are added automatically by the associations in models/index.js.
const Research = sequelize.define(
  'Research',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: mongoId(),
    niche: { type: DataTypes.STRING(100), allowNull: false, validate: required('Niche') },
    topic: { type: DataTypes.TEXT, allowNull: false, validate: required('Topic') },
    title: { type: DataTypes.TEXT, allowNull: false, set: trim('title'), validate: required('Title') },
    summary: { type: DataTypes.TEXT, allowNull: false, set: trim('summary'), validate: required('Summary') },
    source: { type: DataTypes.TEXT, set: trim('source') },
    sourceUrl: { type: DataTypes.TEXT, set: trim('sourceUrl') },
    publicationDate: { type: DataTypes.STRING(100), set: trim('publicationDate') },
    relevanceScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.8,
      validate: { min: 0, max: 1 },
    },
    category: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'News',
      validate: {
        isIn: { args: [['News', 'Academic', 'Social Media', 'Industry Blogs', 'Podcasts']], msg: 'Invalid category' },
      },
    },
    isBookmarked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isRejected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'research', timestamps: true }
);

module.exports = Research;
