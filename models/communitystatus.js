module.exports = (sequelize, DataTypes) => {
    const Communitystatus = sequelize.define(`Communitystatus`, {
        status: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`, `VIP`,'INFLUENCER']
                }
            ),
            defaultValue: `NORMAL`,
            allowNull: false
        },
    }, {
        modelName: 'Communitystatus',
        tableName: 'communitystatuses',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Communitystatus.associate = (db) => {
        db.Communitystatus.belongsTo(db.Community)
        db.Communitystatus.belongsTo(db.User)

    }

    return Communitystatus;
}