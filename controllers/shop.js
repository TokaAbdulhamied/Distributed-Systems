import Product from '../models/product.js'
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import pdf from 'html-pdf'

const __dirpath = path.resolve()

export const getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render(
                'shop/product-list', 
                {
                    prods: products, 
                    pageTitle: 'All Products', 
                    path: '/products', 
            })
        })
    
}

export const getIndex = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render(
                'shop/index', 
                {
                    prods: products, 
                    pageTitle: 'Shop', 
                    path: '/', 
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
            console.log(err)
        })
    // Cart.getCart((cart) => {
    //     Product.fetchAll((products) => {
    //         const cartProducts = []
    //         for (const product of products) {
    //             const cartProduct = cart.products.find(cartProduct => cartProduct.id === product.id)
    //             if (cartProduct) {
    //                 cartProducts.push({productData: product, qty: cartProduct.qty})
    //             }
    //         }
    //         res.render('shop/cart', {
    //             path: '/cart',
    //             pageTitle: 'Your Cart',
    //             products: cartProducts
    //         })
    //     })
        
    // })
    
}

export const getCheckOut = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Check Out',
    })
}

export const getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
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
    Product.findByPk(productId)
        .then((productData) => {
            res.render('shop/product-detail', {
                product: productData,
                pageTitle: productData.title,
                path: '/products',
            })
        })
        .catch(err => {
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
            products[0]['cart item'].quantity +=1
             return products[0]['cart item'].save()
        
        } else {
            return Product.findByPk(prodId)
                .then((product) => {
                    return userCart.addProduct(product, {through: {
                        quantity: 1
                    }})
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
    req.user.getCart()
        .then(cart => {
            userCart = cart
            return cart.getProducts()
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    order.addProducts(
                        products.map(product => {
                            product['order item'] = {quantity: product['cart item'].quantity}
                            return product
                        })
                    )
                })
        })
        .then(() => {
            return userCart.setProducts(null)
        })
        .then(() => {
            return res.redirect('/orders')
        })
        .catch(err => {
            console.log(err)
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