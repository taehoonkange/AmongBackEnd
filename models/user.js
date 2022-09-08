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

    }, {
        modelName: 'User',
        tableName: 'users',
        charset: `utf8`,
        collate: `utf8_general_ci`
    });
    User.associate = (db) => {
        db.User.belongsToMany(db.Ticket, {through: 'Record',as: 'Recorded'}) // 기록된 티켓
        db.User.belongsTo(db.Ticket, { foreignKey: `recordId`}) // 생성자가 누구인지
        db.User.belongsTo(db.Ticket) // 생성자가 누구인지
        db.User.hasMany(db.Ticket, {as: `Owned`}) // 티켓들 소유자
        db.User.hasMany(db.Performance); // 행사들 개최자
        db.User.hasMany(db.Communitystatus) // 커뮤니티 등급
        db.User.hasMany(db.Comment); // 댓글들
        db.User.hasMany(db.Post); // 작성한 게시글들
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }) // 게시물 좋아요
        db.User.hasOne(db.Image) // 프로필 이미지
        db.User.hasOne(db.Community) // 생성된 커뮤니티
        db.User.hasOne(db.Influencer) // 인플루언서일때 생성됨
    }
    return User;
}