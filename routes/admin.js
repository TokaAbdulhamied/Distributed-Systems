import express from 'express'
import path from 'path'
import fs from 'fs'
import * as adminController from '../controllers/admin.js'
import * as authValidators from '../validators/auth-validators.js'
import * as prodValidators from '../validators/product.js'
import validator from 'express-validator'


const {check} = validator
const router = express.Router()


router.get('/add-product', authValidators.isAuth, adminController.getAddProduct);

router.post('/add-product', 
    [
        authValidators.isAuth,
        check('title')
            .trim()
            .isLength({max: 60, min: 5}).withMessage('Title must be between 5 to 60 chars long!'),
        check('image')
            .custom(prodValidators.isImageSelected),
        check('price')
            .isNumeric().withMessage('Invalid Price!'),
        check('description')
            .trim()
            .isLength({min: 5}).withMessage('Description must be between 5 to 60 chars long!')    
            

    ], 
    adminController.postAddProduct
);

router.get('/products', authValidators.isAuth, adminController.getProducts)

router.get('/edit-product/:productId', authValidators.isAuth, adminController.getEditProduct)

router.post('/edit-product', 
    [
        authValidators.isAuth,
        check('title')
            .trim()
            .isLength({max: 60, min: 5}).withMessage('Title must be between 5 to 60 chars long!'),
        check('price')
            .isNumeric().withMessage('Invalid Price!'),
        check('description')
            .trim()
            .isLength({min: 5}).withMessage('Description must be between 5 to 60 chars long!')
    ], 
    adminController.postEditProduct
)

router.post('/delete-product', authValidators.isAuth, adminController.deleteProduct)

router.post('/list', authValidators.isAuth, adminController.listProduct)

export default router