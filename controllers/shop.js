import Product from '../models/product.js'
import User from '../models/user.js'
import OrderItem from '../models/order-item.js'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import pdf from 'html-pdf'
import sequelize from 'sequelize'
import db from '../db/index.js'

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
            res.render(
                'shop/product-list', 
                {
                    prods: products, 
                    pageTitle: 'Products', 
                    path: '/', 
            })
        }).catch((err) => {
            next(err)
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
        res.render(
            'shop/index', 
            {
                prods: products, 
                pageTitle: 'Shop', 
                path: '/shop', 
        })
    }).catch((err) => {
        next(err)
    })
    
}
export const apiGetShop = (req, res, next) => {
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
    }).catch((err) => {
        res.status(422).json({
            success:false,
        })
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
            next(err)
        })
    
}

export const getCheckOut = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Check Out',
    })
}

export const getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(async(orders) => {
            orders = await orders.map(async(order) => {
                order.orderItems = await OrderItem.findAll({where: {
                    orderId: order.id
                }})
                return order
            })
            orders= await Promise.all(orders)
            console.log(orders)
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders,
             })
        })
        .catch(err => {
            next(err)
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
            next(err)

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
        next(err);
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
            next(err)
        })
}

export const postOrder = async(req, res, next) => {
    const transaction = await db.transaction()
    let productUsers = {};
    try {
        const cart = await req.user.getCart()
        const products = await cart.getProducts()
        let price = 0
        
        const done = products.map(async(product) => {
            price= +price + +product.price
            // console.log("user id ", product.userId)
            // const productUser = await User.findByPk(product.userId);
            // console.log("this is the user",productUser)
            // return productUser;
            if(!product.isListed){
                await cart.setProducts(null);
                throw new Error('item already purchased!')      
            }
            productUsers[product.userId] = await User.findByPk(product.userId);
            return 1;

        })
        await Promise.all(done);
        // productUsers = await Promise.all(promises)
        // console.log("all users are", productUsers);
        if (price > req.user.cash) {
            throw new Error('Not enough cash!')
        }
        
        
        const order = await req.user.createOrder({totalPrice: price}, )
        console.log("omar1")
        const promises = await products.map(async(product) => {
            
            
            product.isListed = false
            req.user.cash = +req.user.cash - +product.price
            // console.log("omar2")
            // await productUsers[product.userId]
            console.log('user', productUsers[product.userId])
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
            // console.log("omar3")

            product.userId = req.user.id
            await product.save()
            return 1
            
            
        })
        await Promise.all(promises)
        await req.user.save()
        await cart.setProducts(null)
        // await transaction.commit()
        return res.redirect('/orders')
    }
    catch (error){

        // await transaction.rollback(); 
        next(error)
    }
        
}


export const getSales = (req, res, next) => {
    req.user.getSales().then((sellings) => {
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