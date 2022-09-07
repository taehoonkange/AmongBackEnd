module.exports = (sequelize) => {
    const Community = sequelize.define(`Community`, {


    }, {
        modelName: 'Community',
        tableName: 'communities',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Community.associate = (db) => {
        db.Community.hasMany(db.Post)
        db.Community.hasOne(db.Communitystatus)
        db.Community.belongsTo(db.User)
    }

    return Community;
}