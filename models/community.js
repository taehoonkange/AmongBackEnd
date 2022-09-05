module.exports = (sequelize, DataTypes) => {
    const Community = sequelize.define(`Community`, {


    }, {
        modelName: 'Community',
        tableName: 'communities',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Community.associate = (db) => {
        db.Community.belongsTo(db.User, { foreignKey: `head`})
        db.Community.hasMany(db.Post)
        db.Community.hasOne(db.Communityclass)
    }

    return Community;
}