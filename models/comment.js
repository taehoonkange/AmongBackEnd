module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(`Comment`, {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // 부모 댓글 idx
        ref_comment: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

    }, {
        modelName: 'Comment',
        tableName: 'comments',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User)
        db.Comment.belongsTo(db.Board)
    }

    return Comment;
}