module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(`User`, {
        wallet_address: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        nickname: {
            type: DataTypes.STRING(15)
        },
        userType: {
            type: DataTypes.ENUM({
                    values: [`NORMAL`,'INFLUENCER']
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
        db.User.belongsToMany(db.Ticket, {through: 'OwnTicket', as: 'Owned'} );
        db.User.belongsToMany(db.Ticket, {through: 'CreateTicket',as: 'Created'})
        db.User.hasMany(db.Performance);
        db.User.hasOne(db.Communityclass)
        db.User.hasMany(db.Comment);
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' })
        db.User.hasOne(db.Image)
        db.User.belongsTo(db.Community)
    }

    return User;
}