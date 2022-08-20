module.exports = (sequelize, DataTypes) =>  {
    const Image = sequelize.define(`Image`, {
            // id가 기본적으로 들어있다.
            src: {
                type: DataTypes.STRING(200),
                allowNull: false,
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
        db.Image.belongsTo(db.Ticket);
        db.Image.belongsTo(db.Performance);
    }

    return Image;
};