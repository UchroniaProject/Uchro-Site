module.exports = (sequelize, DataTypes) => {
  const Cell = sequelize.define('Cell', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    coordinates: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    biome: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    height: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'island'
    },
    info: {
      type: DataTypes.STRING,
      defaultValue: 'Aucune information.'
    },
    neighbors: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    timestamps: true,
    paranoid: true
  });

  return Cell;
};
