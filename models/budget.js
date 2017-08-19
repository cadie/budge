
module.exports = function(sequelize, DataTypes) {
    var Budget = sequelize.define("Budget", {
      category: DataTypes.STRING,
      amount: DataTypes.INTEGER,

    });
    return Budget;
  };
