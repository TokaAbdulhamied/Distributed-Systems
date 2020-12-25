import Product from '../../models/product.js'
import User from '../../models/user.js'
import OrderItem from '../../models/order-item.js'
import path from 'path'
import sequelize from 'sequelize'
import db from '../../db/index.js'
import {passError} from '../../helpers.js'


const {Op} = sequelize

const __dirpath = path.resolve()

export const getProducts = (req, res, next) => {
    if(!req.query.search) {
        req.query.search= ''
    }
    Product.findAll({where: {
        isListed: true,
        title: {
            [Op.like]: `%${req.query.search}%`
        }
    }}).then((products) => {
            res.status(200).json({
                success: true,
                products
            })
        }).catch((error) => {
            passError(error, next)
        })
    
}

export const getShop = (req, res, next) => {
    if(!req.query.search) {
        req.query.search= ''
    }
    req.user.getCart().then(cart => {
        return cart.getProducts()
    }).then(products => {
        return products.map(product => {
            return product.id
        })
    }).then((cartProducts) => {
        return Product.findAll({where: {
            isListed: true,
            id: {
                [Op.notIn]: cartProducts
            },
            [Op.not]: [
                {userId: req.user.id}
            ],
            title: {
                [Op.like]: `%${req.query.search}%`
            }
        }})
    }).then((products) => {
        res.status(200).json({
            success: true,
            products
        })
    }).catch((error) => {
        passError(error, next)
    })
    
}


export const getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
        })
        .then((products) => {
            res.status(200).json({
                success: true,
                products
            })
        })
        .catch((error) => {
            passError(error, next)
        })
    
}

export const getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(async(orders) => {
            orders = await orders.map(async(order) => {
                order.dataValues.orderItems = await OrderItem.findAll({where: {
                    orderId: order.id
                }})
                return order
            })
            orders= await Promise.all(orders)
            console.log(orders)
            res.status(200).json({
                success: true,
                orders
            })
        })
        .catch(error => {
            passError(error, next)
        })
    
}

export const getProduct = (req, res, next) => {
    const productId = req.params.prodId
    Product.findOne({where: {
            isListed: true,
            id: productId
        }
    }).then((productData) => {
            if(!productData) {
                const error = new Error("Product not found!")
                error.statusCode = 404
                throw error
            }
            res.status(200).json({
                success: true,
                product: productData
            })
        }).catch(error => {
            passError(error, next)

        })
       
}

export const addCartItem = (req, res, next) => {
   const prodId = req.params.cartItem
   let userCart
   req.user.getCart()
    .then(cart => {
        userCart = cart
        return cart.getProducts({where: {
            id: prodId
        }})
    })
    .then((products) => {
        if(products.length > 0) {
            const error = new Error('Product already exists!')
            error.statusCode = 422
            throw error
        } else {
            return Product.findByPk(prodId)
                .then((product) => {
                    if(!product) {
                        const error = new Error("Product not found!")
                        error.statusCode = 404
                        throw error
                    }
                    if (product.userId === req.user.id) {
                        const error = new Error('Invalid operation user owns this product!')
                        error.statusCode = 422
                        throw error
                    }
                    return userCart.addProduct(product).then(() => {
                        return userCart.getProducts()
                    })
                    
                })
        }
    })
    .then((products) => {
        res.status(200).json({
            success: true,
            cartProducts: products
        })
    })
    .catch(error => {
        passError(error, next);
    })
}

export const deleteCartItem = (req, res, next) => {
    const id = req.params.cartItem
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where:{id}})
        })
        .then(products => {
            if(products.length == 0) {
                const error = new Error("Product not found!")
                error.statusCode = 404
                throw error
            }
            return products[0]['cart item'].destroy()
        })
        .then(() => {
            res.status(200).json({
                success: true
            })
        })
        .catch(error =>{
            passError(error, next)
        })
}

export const makeOrder = async(req, res, next) => {
    let productUsers = {};
    try {
        const cart = await req.user.getCart()
        const products = await cart.getProducts()
        let price = 0
        
        const done = products.map(async(product) => {
            price= +price + +product.price
            if(!product.isListed){
                await cart.setProducts(null);
                throw new Error('item already purchased!')      
            }
            productUsers[product.userId] = await User.findByPk(product.userId);
            return 1;

        })
        await Promise.all(done);
        if (price > req.user.cash) {
            const error = new Error("Not enough cash!")
            error.statusCode = 422
            throw error
        }
        
        
        const order = await req.user.createOrder({totalPrice: price}, )
        const promises = await products.map(async(product) => {
            
            
            product.isListed = false
            req.user.cash = +req.user.cash - +product.price
            productUsers[product.userId].cash = +productUsers[product.userId].cash + +product.price
            await productUsers[product.userId].createSale({
                productName: product.title,
                productPrice: product.price,
                buyer: req.user.email
            }, )

            await order.createOrderItem({
                productName: product.title,
                productPrice: product.price,
                seller: productUsers[product.userId].email,
                userId: req.user.id
            }, )

            await productUsers[product.userId].save()

            product.userId = req.user.id
            await product.save()
            return 1
            
            
        })
        await Promise.all(promises)
        await req.user.save()
        await cart.setProducts(null)
        return res.status(200).json({
            success: true,
            message: "Transaction is complete!"
        })
    }
    catch (error){
        passError(error, next)
    }
        
}


export const getSales = (req, res, next) => {
    req.user.getSales().then((sellings) => {
        return res.status(200).json({
            success: true,
            sales: sellings
        })
    }).catch(error => {
        passError(error, next)
    })
    
}

