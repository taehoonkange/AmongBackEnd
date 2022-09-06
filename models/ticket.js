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
        number: {
            type: DataTypes.STRING(7),
            allowNull: true
        }
    }, {
        modelName: 'Ticket',
        tableName: 'tickets',
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Ticket.associate = (db) => {
        db.Ticket.belongsToMany(db.User, {through: 'OwnTicket', as: 'Ownes'})
        db.Ticket.belongsToMany(db.User,{through: 'CreateTicket',as: 'Creates'})
        db.Ticket.belongsTo(db.Performance)
        db.Ticket.hasOne(db.Image)
        db.Ticket.hasOne(db.Seat)

    }

    return Ticket;
}