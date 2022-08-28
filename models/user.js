module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(`User`, {
        wallet_address: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING(15)
        },
        user_type: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`, `VIP`, `VVIP`, 'Influence']
                }
            ),
            defaultValue: `NORMAL`,
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

    }, {
        modelName: 'User',
        tableName: 'users',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    User.associate = (db) => {
        db.User.hasMany(db.Ticket);
        db.User.hasMany(db.Performance);
        db.User.hasMany(db.Comment);
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' })
    }

    return User;
}