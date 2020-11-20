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
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: Sequelize.STRING
}, {
    indexes: [
        {
            fields: ['email']
        }
    ]
})

export default User