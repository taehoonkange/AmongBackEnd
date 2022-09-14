module.exports = (sequelize, DataTypes) => {
    const Performance = sequelize.define(`Performance`, {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        place: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        time: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        limitedAge: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        term_start_at:{
            type: DataTypes.DATE,
            allowNull: false
        },

        term_end_at:{
            type: DataTypes.DATE,
            allowNull: false
        },
        start_at:{
            type: DataTypes.DATE,
            allowNull: false
        },
        end_at:{
            type: DataTypes.DATE,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price_infomation: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        performanceStatus: {
            type: DataTypes.ENUM({
                    values: [`INPROCESS`,'DONE']
                }
            ),
            defaultValue: `INPROCESS`,
            allowNull: false
        }
    }, {
        modelName: 'Performance',
        tableName: `performances`,
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Performance.associate = (db) => {
        db.Performance.hasMany(db.Seat) // 공연 좌석들
        db.Performance.hasMany(db.Ticket) // 공연 티켓들
        db.Performance.hasOne(db.Image) // 공연 이미지
        db.Performance.belongsTo(db.User) // 누가 개최했는지
        db.Performance.hasOne(db.Seatgui) // 누가 개최했는지
    }

    return Performance;
}