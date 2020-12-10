import Sequelize from 'sequelize'
import db from '../db/index.js'


const CartItem = db.define('cart item', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    
})

export default CartItem