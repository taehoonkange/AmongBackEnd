module.exports = (sequelize, DataTypes) => {
    const Influencer = sequelize.define(`Influencer`, {
        name: {
            type: DataTypes.STRING(15)
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    }, {
        modelName: 'Influencer',
        tableName: 'influencers',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    Influencer.associate = (db) => {
        db.Influencer.hasOne(db.Image)
        db.Influencer.belongsTo(db.User)

    }
    return Influencer;
}