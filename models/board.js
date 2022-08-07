module.exports = (sequelize, DataTypes) => {
    const Board = sequelize.define(`Board`, {
        title: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        img_src: {
            type: DataTypes.STRING(200),
            allowNull: true
        }

    }, {
        modelName: 'Board',
        tableName: 'boards',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Board.associate = (db) => {
        db.Board.belongsTo(db.User)
        db.Board.hasMany(db.Comment)
    }

    return Board;
}