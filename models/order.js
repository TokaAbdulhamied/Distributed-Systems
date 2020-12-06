import Sequelize from 'sequelize'
import db from '../db/index.js'


const Order = db.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
})

export default Order