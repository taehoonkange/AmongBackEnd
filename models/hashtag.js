module.exports = (sequelize, DataTypes) => {
    const Hashtag = sequelize.define(`Hashtag`, {
        title: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
        }

    }, {
        modelName: 'Hashtag',
        tableName: 'hashtags',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Hashtag.associate = (db) => {
        db.Hashtag.belongsToMany(db.Post, {through: `PostHashtag`})

    }

    return Hashtag;
}