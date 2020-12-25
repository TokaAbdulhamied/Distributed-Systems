import express from 'express'
import * as authController from '../controllers/auth.js'
import {isAuth, isNewEmail} from '../controllers/auth.js'
import validator from 'express-validator'
import * as authValidators from '../../validators/auth-validators.js'

const {body} = validator
const router = express.Router();


router.post('/login', authController.login)
router.post('/signup',
    [   
        body('email').isEmail().withMessage('Please enter a valid email!')
        .custom(isNewEmail).normalizeEmail(),
        body('name').trim().isLength({min: 5}).withMessage("Name must be more than 5 chars long!"),
        body('password').isLength({min:5}).withMessage('Password must be more than 5 chars long!')   
    ], 
    authController.signUp
)
router.post('/add-cash', 
    [
        isAuth,
        body('cash').isNumeric().withMessage('Enter a valid number!')
    ], 
    authController.addCash
)






export default router;