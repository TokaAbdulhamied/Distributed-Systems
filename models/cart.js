import Sequelize from 'sequelize'
import db from '../db/index.js'


const Cart = db.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

})

export default Cart