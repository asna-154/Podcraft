const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { trim, mongoId } = require('./helpers');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    _id: mongoId(),
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      set: trim('fullName'),
      validate: {
        notNull: { msg: 'Full name is required' },
        notEmpty: { msg: 'Full name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      // Mongoose: lowercase + trim
      set(value) {
        this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
      },
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email is required' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        len: { args: [8, 255], msg: 'Password must be at least 8 characters' },
      },
    },
    subscription: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'free',
      validate: { isIn: { args: [['free', 'premium']], msg: 'Invalid subscription' } },
    },
    loginAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lockUntil: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    // Mongoose stored notificationPreferences as a nested object. In SQL it is two
    // columns, and the virtual field below keeps `user.notificationPreferences.email`
    // working exactly as before.
    notifyEmail: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notifyPush: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notificationPreferences: {
      type: DataTypes.VIRTUAL,
      get() {
        return { email: this.getDataValue('notifyEmail'), push: this.getDataValue('notifyPush') };
      },
      set(value) {
        if (value && typeof value === 'object') {
          if (value.email !== undefined) this.setDataValue('notifyEmail', value.email);
          if (value.push !== undefined) this.setDataValue('notifyPush', value.push);
        }
      },
    },

    lastLogin: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Same job as your Mongoose pre('save') hook: hash the password when it changes.
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = User;
