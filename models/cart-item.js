import Sequelize from 'sequelize'
import db from '../db/index.js'


const CartItem = db.define('cart item', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
})

export default CartItem