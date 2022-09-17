module.exports = (sequelize, DataTypes) =>  {
    const Image = sequelize.define(`Image`, {
            // id가 기본적으로 들어있다.
            src: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
        }, {
            modelName: 'Image',
            tableName: 'images',
            charset: 'utf8',
            collate: 'utf8_general_ci',
            sequelize,
        });

    Image.associate = (db) => {
        db.Image.belongsTo(db.Post);
        db.Image.belongsTo(db.User);
        db.Image.belongsToMany(db.Ticket, {through: `ticketImage`, as: `SetImg`});
        db.Image.belongsTo(db.Performance);
        db.Image.belongsTo(db.Influencer);
    }

    return Image;
};