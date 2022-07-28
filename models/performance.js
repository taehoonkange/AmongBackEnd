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
        term_start_at:{
            type: DataTypes.DATE,
            allowNull: false
        },

        term_end_at:{
            type: DataTypes.DATE,
            allowNull: false
        },
        start_at:{
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        end_at:{
            type: DataTypes.DATEONLY,
            allowNull: false
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
        modelName: 'Performance',
        tableName: `performances`,
        charset: `utf8mb4`,
        collate: `utf8mb4_general_ci`
    });
    Performance.associate = (db) => {
        db.Performance.hasMany(db.Seat)
    }

    return Performance;
}