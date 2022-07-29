module.exports = (sequelize, DataTypes) => {
    const Seat = sequelize.define(`Seat`, {
        class: {
            type: DataTypes.STRING(8),
            allowNull: false
        },
        price:{
            type: DataTypes.FLOAT(8),
            allowNull: false
        },
        number: {
            type: DataTypes.STRING(7),
            allowNull: true
        },

    }, {
        modelName: 'Seat',
        tableName: 'seats',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Seat.associate = (db) => {
        db.Seat.belongsTo(db.Performance)
    }

    return Seat;
}