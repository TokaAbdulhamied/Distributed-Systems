import db from '../db/index.js'
import Sequelize from 'sequelize'


const Product = db.define('product', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isListed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    } 
})

export default Product