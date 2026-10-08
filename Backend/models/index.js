// Loads every model and wires up the relationships between them.
// Loading this file once (db.js does it at startup) is enough: after that,
// require('../models/User') anywhere returns the same, fully connected model.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Episode = require('./Episode');
const Guest = require('./Guest');
const Research = require('./Research');

const fk = (name) => ({ name, allowNull: false });

// User -> Episodes
User.hasMany(Episode, { foreignKey: fk('userId'), as: 'episodes', onDelete: 'CASCADE' });
Episode.belongsTo(User, { foreignKey: fk('userId'), as: 'user', onDelete: 'CASCADE' });

// Episode -> Guests (was the embedded guests array)
Episode.hasMany(Guest, { foreignKey: fk('episodeId'), as: 'guests', onDelete: 'CASCADE' });
Guest.belongsTo(Episode, { foreignKey: fk('episodeId'), as: 'episode', onDelete: 'CASCADE' });

// Episode -> Research (the direct `episode` link on Research)
Episode.hasMany(Research, { foreignKey: fk('episodeId'), as: 'research', onDelete: 'CASCADE' });
Research.belongsTo(Episode, { foreignKey: fk('episodeId'), as: 'episode', onDelete: 'CASCADE' });

// User -> Research (the direct `user` link on Research).
// NO ACTION here is deliberate: SQL Server rejects tables that can be reached by
// two different cascading-delete paths (User->Research and User->Episode->Research).
User.hasMany(Research, { foreignKey: fk('userId'), as: 'research', onDelete: 'NO ACTION' });
Research.belongsTo(User, { foreignKey: fk('userId'), as: 'user', onDelete: 'NO ACTION' });

// Episode <-> Research bookmarks (was the bookmarkedTopics array on Episode).
// The link table is defined by hand so each delete rule is explicit.
const EpisodeBookmark = sequelize.define(
  'EpisodeBookmark',
  {
    episodeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: Episode, key: 'id' },
      onDelete: 'CASCADE',
    },
    researchId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: Research, key: 'id' },
      onDelete: 'NO ACTION',
    },
  },
  { tableName: 'episode_bookmarks', timestamps: false }
);

Episode.belongsToMany(Research, {
  through: EpisodeBookmark,
  as: 'bookmarkedTopics',
  foreignKey: 'episodeId',
  otherKey: 'researchId',
  constraints: false,
});
Research.belongsToMany(Episode, {
  through: EpisodeBookmark,
  as: 'bookmarkedByEpisodes',
  foreignKey: 'researchId',
  otherKey: 'episodeId',
  constraints: false,
});

// Deleting a research item also removes its bookmarks first.
Research.beforeDestroy(async (research, options) => {
  await EpisodeBookmark.destroy({
    where: { researchId: research.id },
    transaction: options.transaction,
  });
});

module.exports = { sequelize, User, Episode, Guest, Research, EpisodeBookmark };
