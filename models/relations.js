import Cart from './cart.js'
import CartItem from './cart-item.js'
import Order from './order.js'
import OrderItem from './order-item.js'
import Product from './product.js'
import User from './user.js'
import Session from './session.js'


const createDataBaseRelations = () => {
    Product.belongsTo(User, {onDelete: 'CASCADE'})
    User.hasMany(Product)
    User.hasOne(Cart)
    Cart.belongsTo(User)
    Cart.belongsToMany(Product, {through: CartItem})
    Product.belongsToMany(Cart, {through: CartItem})
    Order.belongsTo(User)
    User.hasMany(Order)
    Order.belongsToMany(Product, {through: OrderItem})
    Product.belongsToMany(Order, {through: OrderItem})
}

export default createDataBaseRelations;