import Sequelize from 'sequelize'
import db from '../db/index.js'


const OrderItem = db.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    productName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productPrice: {
        type: Sequelize.STRING,
        allowNull: false
    },
    seller: {
        type: Sequelize.STRING,
        allowNull: false
    },
    orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    }
})

export default OrderItem