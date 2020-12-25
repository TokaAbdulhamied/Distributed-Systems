import express from 'express';
import * as shopController from '../controllers/shop.js'
import {isAuth} from '../controllers/auth.js'


const router = express.Router()

router.get('/products', shopController.getProducts)

router.get('/shop', isAuth, shopController.getShop)

router.get('/products/:prodId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart/:cartItem', isAuth, shopController.addCartItem)

router.get('/orders', isAuth, shopController.getOrders)

router.delete('/cart/:cartItem', isAuth, shopController.deleteCartItem)

router.post('/create-order', isAuth, shopController.makeOrder)

router.get('/sales', isAuth, shopController.getSales)

export default router