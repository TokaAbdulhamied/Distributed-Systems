import Sequelize from 'sequelize'
import db from '../db/index.js'


const Sale = db.define('sale', {
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
    buyer: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

export default Sale