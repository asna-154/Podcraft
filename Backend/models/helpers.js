const { DataTypes } = require('sequelize');

// Mongoose's `trim: true`: strip surrounding spaces when a text field is set.
const trim = (field) =>
  function (value) {
    this.setDataValue(field, typeof value === 'string' ? value.trim() : value);
  };

// Mongoose gave every document a string `_id`. Your React app and controllers
// most likely read it, so every model exposes `_id` too (it simply mirrors `id`).
const mongoId = () => ({
  type: DataTypes.VIRTUAL,
  get() {
    const id = this.getDataValue('id');
    return id === undefined || id === null ? undefined : String(id);
  },
});

module.exports = { trim, mongoId };
