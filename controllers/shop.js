import Product from '../models/product.js'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import pdf from 'html-pdf'
import sequelize from 'sequelize'

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

export const postOrder = (req, res, next) => {
    let userCart
    let productData
    req.user.getCart()
        .then(cart => {
            userCart = cart
            return cart.getProducts({include: ['user']})
        })
        .then(products => {
            let price = 0
            products.forEach(product => {
                price= +price + +product.price
            })
            if (price > req.user.cash) {
                throw new Error('Not enough cash!')
            }
            return req.user.createOrder({totalPrice: price})
                .then(order => {
                    console.log(products)
                    
                    products.forEach(product => {
                        product.userId = req.user.id
                        product.isListed = false
                        req.user.cash = +req.user.cash - +product.price
                        product.user.cash = +product.user.cash + +product.price
                        return product.user.createSale({
                            productName: product.title,
                            productPrice: product.price,
                            buyer: req.user.email
                        }).then(() => {
                            return order.createOrderItem({
                                productName: product.title,
                                productPrice: product.price,
                                seller: product.user.email
                            })
                        }).then(() => {
                            return product.save()
                        }).then(() => {
                            return product.user.save()
                        }).then(() => {
                            return req.user.save()
                        })
                        
                        
                        
                        
                    })       
                })
      
        })
        .then(() => {
            return userCart.setProducts(null)
        })
        .then(() => {
            return res.redirect('/orders')
        })
        .catch(err => {
            next(err)
        })
}

export const getSales = (req, res, next) => {
    req.user.getSales().then((sellings) => {
        console.log(sellings)
        return res.render('shop/sellings', {
            pageTitle: 'My Sellings',
            path: '/sales',
            sellings: sellings
    
        }).catch(err => {
            next(err)
        })
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