module.exports = (sequelize, DataTypes) => {
    const Communityclass = sequelize.define(`Communityclass`, {
        Class: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`,'INFLUENCER']
                }
            ),
            defaultValue: `NORMAL`,
            allowNull: false
        },
    }, {
        modelName: 'Communityclass',
        tableName: 'communityclasses',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Communityclass.associate = (db) => {
        db.Communityclass.belongsTo(db.Community)
        db.Communityclass.belongsTo(db.User)

    }

    return Communityclass;
}