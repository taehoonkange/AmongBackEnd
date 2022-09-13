module.exports = (sequelize, DataTypes) => {
    const Seatgui = sequelize.define(`Seatgui`, {

        seatNumber:{
            type: DataTypes.INTEGER,
        },
        x:{
            type: DataTypes.INTEGER,
        },
        y:{
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING(8),
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(9),
            allowNull: true
        },
        day: {
            type: DataTypes.DATE,
            allowNull: false
        }

    }, {
        modelName: 'Seatgui',
        tableName: 'seatguies',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Seatgui.associate = (db) => {
        db.Seatgui.belongsTo(db.Performance) // 어느 공연인지
    }

    return Seatgui;
}