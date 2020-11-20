import Sequelize from 'sequelize'
import db from '../db/index.js'


const OrderItem = db.define('order item', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
})

export default OrderItem