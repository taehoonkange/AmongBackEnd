module.exports = (sequelize, DataTypes) => {
    const Limiteduser = sequelize.define(`Limiteduser`, {
        status: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`, `VIP`]
                }
            ),
            defaultValue: `NORMAL`
            ,
            allowNull: false
        },

    }, {
        modelName: 'Limiteduser',
        tableName: 'limitedusers',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Limiteduser.associate = (db) => {
        db.Limiteduser.belongsTo(db.Post)

    }

    return Limiteduser;
}