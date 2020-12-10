import path from 'path';
import express from 'express';
import * as shopController from '../controllers/shop.js'
import adminData from './admin.js';
import {isAuth} from '../controllers/auth.js'


const router = express.Router()

router.get('/', shopController.getProducts)

router.get('/shop', shopController.getShop)

router.get('/products/:prodId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart', isAuth, shopController.postCart)

router.get('/checkout', isAuth, shopController.getCheckOut)

router.get('/orders', isAuth, shopController.getOrders)

router.post('/cart/delete', isAuth, shopController.deleteCartItem)

router.post('/create-order', isAuth, shopController.postOrder)

router.post('/orders/:orderId', isAuth, shopController.downloadInovice)

router.get('/sales', isAuth, shopController.getSales)
router.get('/api/shop', shopController.apiGetShop)

export default router