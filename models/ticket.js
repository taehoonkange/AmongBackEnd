module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define(`Ticket`, {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM({
            values: [`SALE`, `OWNED`, `USED`, `EXPIRED`]
                }
            ),
            defaultValue: `SALE`,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        originalPrice:{
            type: DataTypes.STRING(7),
            allowNull: true
        },
        // orginal Price 추가 리셀 가격 때문에
        price: {
                type: DataTypes.STRING(7),
                allowNull: true
        },
        //price min , max
        coordinate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        day: {

            type: DataTypes.DATE,

            allowNull: false
        },
        start_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_at: {
            type: DataTypes.DATE,
            allowNull: false
        }

    }, {
        modelName: 'Ticket',
        tableName: 'tickets',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Ticket.associate = (db) => {
        db.Ticket.belongsToMany(db.User,{  through: 'Record',as: 'Records'}) // 소유자 기록
        db.Ticket.belongsToMany(db.User, { through: `CreatTicket`, as : `Creates`}) // 생성자
        db.Ticket.belongsTo(db.User, {foreignKey: `OwnerId`}) // 소유자가 어떤 티켓을 소지하는지
        db.Ticket.belongsTo(db.Performance) // 어떤 공연의 티켓인지
        db.Ticket.belongsToMany(db.Image, { through: `ticketImage`, as: `GetImg`}) // 티켓 이미지
        db.Ticket.hasOne(db.Seat) // 티켓 좌석

    }

    return Ticket;
}