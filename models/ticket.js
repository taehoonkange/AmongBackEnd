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
        state: {
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
        }
    }, {
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Ticket.associate = (db) => {
        db.Ticket.hasMany(db.Seat)
        db.Ticket.belongsTo(db.User)

    }

    return Ticket;
}