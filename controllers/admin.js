import Product from '../models/product.js'
import Order from '../models/order.js'
import validator from 'express-validator'


const {validationResult} = validator

export const getAddProduct = (req, res, next) => {
    res.render(
        'admin/edit-product', 
        {
            pageTitle: 'Add product', 
            path: '/admin/add-product',
    })
} 

export const postAddProduct = (req, res, next) => {
    const errors = validationResult(req)
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    if (!errors.isEmpty()) {  
        return res.status(422).render(
            'admin/edit-product', 
            {
                pageTitle: 'Add product', 
                path: '/admin/add-product',
                product: {
                    title,
                    description,
                    price,                    
                },
                errorMssg: errors.array()[0].msg
        })
    }
    req.user.createProduct({
        title,
        imageUrl: image.filename,
        description,
        price,
    }).then(() => {
        res.redirect('/admin/products')
    }).catch(err => {
        next(err)
    })
               
    
}

export const getProducts = (req, res, next) => {
    req.user.getProducts()
        .then((products) => {
        res.render(
            'admin/products', 
            {
                prods: products, 
                pageTitle: 'Admin Products', 
                path: '/admin/products', 
        })
        })
        .catch(err => next(err))
}

export const getEditProduct = (req, res, next) => {
    const productId = req.params.productId
    Product.findByPk(productId)
        .then(productData => {
            if (productData.userId === req.user.id) {
                res.render('admin/edit-product', {
                    product: productData,
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    }
                    )
            }
            res.redirect('/admin/products')
            
        })
        .catch(err => {
            next(err)
        })
}

export const postEditProduct = (req, res, next) => {
    const productId = req.body.id
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render(
            'admin/edit-product', 
            {
                pageTitle: 'Add product', 
                path: '/admin/edit-product',
                product: {
                    title,
                    description,
                    price,
                    id: productId,
                    
                },
                errorMssg: errors.array()[0].msg
        })
    }
    Product.findByPk(productId)
        .then(product => {
            if (product.userId === req.user.id) {
                product.title = title
                product.price = price;
                if (image) {
                    product.imageUrl = image.filename;
                }                
                product.description = description
                return product.save()
            }   
        })
        .then(() => {
            res.redirect('/admin/products')
        })
        .catch(err => {
            next(err)
        })
}

export const deleteProduct = (req, res, next) => {
    const id = req.body.id
    Product.findByPk(id)
        .then(product => {
            if (product.userId === req.user.id)
            {
                return product.destroy()
            }
        })
        .then(() => {
            res.redirect('/admin/products')
        })
        .catch(err =>{
            const error = new Error('test')
            next(error)
        })
    
}

export const listProduct = (req, res, next) => {
    const id = req.body.id
    Product.findByPk(id)
        .then(product => {
            if (product.userId === req.user.id)
            {
                product.isListed = !product.isListed
                return product.save()
            }
        })
        .then(() => {
            res.redirect('/admin/products')
        })
        .catch(err =>{
            const error = new Error('test')
            next(error)
        })
}

export const getAllOrders = async(req, res, next) => {
    try {
        if(!req.user.isAdmin) {
            throw new Error('You must be an admin to view this page!')
        }
        const orders = await Order.findAll({include: ['orderItems', 'user']})
        return res.render('shop/all-orders', {
            path: '/admin/allorders',
            pageTitle: 'All Orders',
            orders: orders,
         })
    } catch(error) {
        next(error)
    }
}

