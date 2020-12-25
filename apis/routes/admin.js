import express from 'express'
import * as adminController from '../controllers/admin.js'
import * as prodValidators from '../../validators/product.js'
import validator from 'express-validator'
import {isAuth} from '../controllers/auth.js'



const {check} = validator
const router = express.Router()




router.post('/products', 
    [
        isAuth,
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
    adminController.addProduct
);

router.get('/my-products', isAuth, adminController.getProducts)



router.put('/products/:productId', 
    [
        isAuth,
        check('title')
            .trim()
            .isLength({max: 60, min: 5}).withMessage('Title must be between 5 to 60 chars long!'),
        check('price')
            .isNumeric().withMessage('Invalid Price!'),
        check('description')
            .trim()
            .isLength({min: 5}).withMessage('Description must be between 5 to 60 chars long!')
    ], 
    adminController.editProduct
)

router.delete('/products/:productId', isAuth, adminController.deleteProduct)

router.patch('/list-unlist-product/:productId', isAuth, adminController.listProduct)

router.get('/admin/allorders', isAuth, adminController.getAllOrders)

export default router