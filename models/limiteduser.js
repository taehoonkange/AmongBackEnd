module.exports = (sequelize, DataTypes) => {
    const Limiteduser = sequelize.define(`Limiteduser`, {
        status: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`, `VIP`,'INFLUENCER']
                }
            ),
            defaultValue: `NORMAL`
            ,
            allowNull: false
        },

    }, {
        modelName: 'Limiteduser',
        tableName: 'limitedusers',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Limiteduser.associate = (db) => {
        db.Limiteduser.belongsTo(db.User)

    }

    return Limiteduser;
}