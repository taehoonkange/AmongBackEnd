module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define(`Ticket`, {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM({
            values: [`SALE`, `OWNED`, `USED`]
                }
            ),
            defaultValue: `SALE`,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
                type: DataTypes.STRING(7),
                allowNull: true
        },
        coordinate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        day: {
            type: DataTypes.INTEGER,

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
        db.Ticket.hasMany(db.User,{  foreignKey: `recordId`,as: 'Records'}) // 소유자 기록
        db.Ticket.hasOne(db.User, { as : `Creater`}) // 생성자
        db.Ticket.belongsTo(db.User) // 소유자가 어떤 티켓을 소지하는지
        db.Ticket.belongsTo(db.Performance) // 어떤 공연의 티켓인지
        db.Ticket.hasOne(db.Image) // 티켓 이미지
        db.Ticket.hasOne(db.Seat) // 티켓 좌석

    }

    return Ticket;
}