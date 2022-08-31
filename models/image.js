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
        db.Image.hasOne(db.Post);
        db.Image.hasOne(db.User);
        db.Image.hasOne(db.Ticket);
        db.Image.hasOne(db.Performance);
    }

    return Image;
};