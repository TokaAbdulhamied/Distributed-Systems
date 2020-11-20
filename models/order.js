import Sequelize from 'sequelize'
import db from '../db/index.js'


const Order = db.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

export default Order