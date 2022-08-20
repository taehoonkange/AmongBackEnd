module.exports = (sequelize, DataTypes) => {
    const Refcomment = sequelize.define(`Refcomment`, {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },


    }, {
        modelName: 'Refcomment',
        tableName: 'refcomments',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User)
        db.Comment.belongsTo(db.Post)
        db.Comment.belongsTo(db.Comment)
    }

    return Refcomment;
}