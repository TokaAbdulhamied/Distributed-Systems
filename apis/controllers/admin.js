import Product from '../../models/product.js'
import Order from '../../models/order.js'
import OrderItem from '../../models/order-item.js'
import validator from 'express-validator'
import { passError } from '../../helpers.js'


const {validationResult} = validator



export const addProduct = (req, res, next) => {
    const errors = validationResult(req)
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    if (!errors.isEmpty()) {
        const error = new Error("Validation error!")
        error.statusCode = 422
        error.validators = errors.array();
        throw error; 
    }
    req.user.createProduct({
        title,
        imageUrl: image.filename,
        description,
        price,
    }).then((product) => {
        res.status(201).json({
            success: true,
            product
        })
    }).catch(error => {
        passError(error, next)
    })
               
    
}

export const getProducts = (req, res, next) => {
    req.user.getProducts()
        .then((products) => {
            res.status(200).json({
                success: true,
                products
            })
        }).catch(error => passError(error, next))
}



export const editProduct = (req, res, next) => {
    const productId = req.params.productId
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation error!")
        error.statusCode = 422
        error.validators = errors.array();
        throw error; 
    }
    Product.findByPk(productId)
        .then(product => {
            if(!product) {
                const error = new Error("Product not found!")
                error.statusCode = 404
                throw error
            }
            if (product.userId !== req.user.id) {
                const error = new Error("You can't edit or delete this item because you don't own it!")
                error.statusCode = 403
                throw error
            }
            product.title = title
            product.price = price;
            if (image) {
                product.imageUrl = image.filename;
            }                
            product.description = description
            return product.save()   
        })
        .then((product) => {
            res.status(200).json({
                success: true,
                product
            })
        })
        .catch(error => {
            passError(error, next)
        })
}

export const deleteProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findByPk(id)
        .then(product => {
            if(!product) {
                const error = new Error("Product not found!")
                error.statusCode = 404
                throw error
            }
            if (product.userId !== req.user.id) {
                const error = new Error("You can't edit or delete this item because you don't own it!")
                error.statusCode = 403
                throw error
            }
            return product.destroy()
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

export const listProduct = (req, res, next) => {
    const id = req.params.productId
    Product.findByPk(id)
        .then(product => {
            if(!product) {
                const error = new Error("Product not found!")
                error.statusCode = 404
                throw error
            }
            if (product.userId !== req.user.id) {
                const error = new Error("You can't list or unlist this item because you don't own it!")
                error.statusCode = 403
                throw error
            }
            product.isListed = !product.isListed
            return product.save()
        })
        .then((product) => {
            res.status(200).json({
                success: true,
                product
            })
        })
        .catch(error =>{
            passError(error, next)
        })
}

export const getAllOrders = async(req, res, next) => {
    try {
        if(!req.user.isAdmin) {
            const error = new Error('You must be an admin to use this api!')
            error.statusCode = 403
            throw error
        }
        let orders = await Order.findAll({order: [['createdAt', 'ASC'],],include: ['user']})
        orders = orders.map(async(order) => {
            order.dataValues.orderItems = await OrderItem.findAll({where: {
                orderId: order.id
            }})
            delete order.dataValues.user.dataValues.password
            delete order.dataValues.user.dataValues.cash
            delete order.dataValues.user.dataValues.isAdmin
            order.dataValues.buyer = order.dataValues.user
            delete order.dataValues.user
            console.log(order)
            return order;
        })
       
        orders= await Promise.all(orders)
        return res.status(200).json({
            success: true,
            orders
        })
    } catch(error) {
        passError(error, next)
    }
}

