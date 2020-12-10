import Sequelize from 'sequelize'
import db from '../db/index.js'


const User = db.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: Sequelize.STRING,
    cash: {
        type: Sequelize.FLOAT,
        defaultValue: 0
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    indexes: [
        {
            fields: ['email']
        }
    ]
})

export default User