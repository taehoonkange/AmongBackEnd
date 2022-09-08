module.exports = (sequelize, DataTypes) => {
    const Seat = sequelize.define(`Seat`, {
        class: {
            type: DataTypes.STRING(8),
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
        db.Seat.belongsTo(db.Performance) // 어느 공연인지
        db.Seat.belongsTo(db.Ticket) // 어떤 티켓인지
    }

    return Seat;
}