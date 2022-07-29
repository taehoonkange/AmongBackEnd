module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define(`Ticket`, {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        // buyer:{
        //     type: DataTypes.ARRAY(DataTypes.STRING(50)),
        //     allowNull: true
        // },
        status: {
            type: DataTypes.ENUM({
            values: [`SALE`, `RESALE`, `NONE`]
                }
            ),
            defaultValue: `SALE`,
            allowNull: false
        },
        allow_resale : {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        img_src: {
            type: DataTypes.STRING(200),
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
        db.Ticket.belongsTo(db.User)
        db.Ticket.belongsTo(db.Performance)

    }

    return Ticket;
}