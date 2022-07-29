module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(`User`, {
        wallet_address: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING(15)
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        img_src: {
            type: DataTypes.STRING(200),
            allowNull: true
        }
    }, {
        modelName: 'User',
        tableName: 'users',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    User.associate = (db) => {
        db.User.hasMany(db.Ticket);
        db.User.hasMany(db.Performance);

    }

    return User;
}