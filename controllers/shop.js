import Product from '../models/product.js'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import pdf from 'html-pdf'
import sequelize from 'sequelize'
import db from '../db/index.js'

const {Op} = sequelize

const __dirpath = path.resolve()

export const getProducts = (req, res, next) => {

    Product.findAll({where: {
        isListed: true
    }}).then((products) => {
            res.render(
                'shop/product-list', 
                {
                    prods: products, 
                    pageTitle: 'Products', 
                    path: '/', 
            })
        }).catch((err) => {
            console.log(err)
        })
    
}

export const getShop = (req, res, next) => {
    req.user.getCart().then(cart => {
        return cart.getProducts()
    }).then(products => {
        return products.map(product => {
            return product.id
        })
    }).then((cartProducts) => {
        console.log(cartProducts)
        return Product.findAll({where: {
            isListed: true,
            id: {
                [Op.notIn]: cartProducts
            },
            [Op.not]: [
                {userId: req.user.id}
            ]
        }})
    }).then((products) => {
        res.render(
            'shop/index', 
            {
                prods: products, 
                pageTitle: 'Shop', 
                path: '/shop', 
        })
    }).catch((err) => {
        console.log(err)
    })
    
}

export const getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
        })
        .then((products) => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
            })
        })
        .catch((err) => {
            console.log(err)
        })
    
}

export const getCheckOut = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Check Out',
    })
}

export const getOrders = (req, res, next) => {
    req.user.getOrders({include: ['orderItems']})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders,
             })
        })
        .catch(err => {
            console.log(err)
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
                res.redirect('/')
            }
            res.render('shop/product-detail', {
                product: productData,
                pageTitle: productData.title,
                path: '/',
            })
        }).catch(err => {
            console.log(err)

        })
       
}

export const postCart = (req, res, next) => {
   const prodId = req.body.productId
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
            throw new Error('product already exists')

        
        } else {
            return Product.findByPk(prodId)
                .then((product) => {
                    if (product.userId === req.user.id) {
                        throw new Error('Invalid Operation')
                    }
                    return userCart.addProduct(product)
                })
        }
    })
    .then(() => {
        res.redirect('/cart')
    })
    .catch(err => {
        console.log(err)
    })
}

export const deleteCartItem = (req, res, next) => {
    const id = req.body.id
    req.user.getCart()
        .then(cart => {
            return cart.getProducts({where:{id}})
        })
        .then(products => {
            return products[0]['cart item'].destroy()
        })
        .then(() => {
            res.redirect('/cart')
        })
        .catch(err =>{
            console.log(err)
        })
}

export const postOrder = async(req, res, next) => {
    const transaction = await db.transaction()
    try {
        const cart = await req.user.getCart()
        const products = await cart.getProducts({include: ['user']})
        let price = 0
        products.forEach(product => {
            price= +price + +product.price
        })
        if (price > req.user.cash) {
            throw new Error('Not enough cash!')
        }
        
        const order = await req.user.createOrder({totalPrice: price}, {transaction})
        await products.forEach(async(product) => {
            product.userId = req.user.id
            product.isListed = false
            req.user.cash = +req.user.cash - +product.price
            product.user.cash = +product.user.cash + +product.price
            await product.user.createSale({
                productName: product.title,
                productPrice: product.price,
                buyer: req.user.email
            }, {transaction})
            await order.createOrderItem({
                productName: product.title,
                productPrice: product.price,
                seller: product.user.email
            }, {transaction})
            await product.save({transaction})
            await product.user.save({transaction})
        })
        await req.user.save({transaction})
        await cart.setProducts(null,{transaction})
        return await transaction.commit()
    }
    catch (error){
        console.log(error)
        await transaction.rollback();
        next(error)
    }
        
}


export const getSales = (req, res, next) => {
    req.user.getSales().then((sellings) => {
        console.log(sellings)
        return res.render('shop/sellings', {
            pageTitle: 'My Sellings',
            path: '/sales',
            sellings: sellings
    
        })
    }).catch(err => {
        next(err)
    })
    
}

export const downloadInovice = (req, res, next) => {
    const htmlPath = path.join(__dirpath, 'templates', 'inovice.html')
    console.log(htmlPath)
    ejs.renderFile(htmlPath, (err, data) => {
        if(err) {
            console.log(err)
        }
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"')
        const options = {
            "height": "15.25in",
            "width": "15.5in",
            
        };
        pdf.create(data, options).toStream((err, stream) => {
            if(err) {
                console.log(err)
            }
            stream.pipe(res);
        });
        
        // res.send(data)
    })
    
    // pdfFile.pipe(res)
}