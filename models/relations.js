import Cart from './cart.js'
import CartItem from './cart-item.js'
import Order from './order.js'
import OrderItem from './order-item.js'
import Product from './product.js'
import User from './user.js'
import Session from './session.js'
import Sale from './sale.js'
import sequelize from 'sequelize'
import db from '../db/index.js'


const createDataBaseRelations = () => {
    Product.belongsTo(User, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    User.hasMany(Product)
    User.hasOne(Cart, {foreignKey: 'id', onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    Cart.belongsTo(User, {onDelete: 'CASCADE', onUpdate: 'RESTRICT',foreignKey: 'id'})
    Cart.belongsToMany(Product, {through: CartItem})
    Product.belongsToMany(Cart, {through: CartItem})
    Order.belongsTo(User, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    User.hasMany(Order)
    OrderItem.belongsTo(Order, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    Order.hasMany(OrderItem)
    Sale.belongsTo(User, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    User.hasMany(Sale)
    User.hasMany(OrderItem, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    OrderItem.belongsTo(User, {onDelete: 'CASCADE', onUpdate: 'RESTRICT'})
    
    // Order.belongsToMany(Product, {through: OrderItem})
    // Product.belongsToMany(Order, {through: OrderItem})
}

export default createDataBaseRelations;
