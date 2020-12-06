import express from 'express'
import * as authController from '../controllers/auth.js'
import {isAuth} from '../controllers/auth.js'
import validator from 'express-validator'
import * as authValidators from '../validators/auth-validators.js'

const {check} = validator
const router = express.Router();

router.get('/login', authController.getLogin)
router.post('/login', 
    [
        check('email')
            .normalizeEmail()
            .isEmail().withMessage('Please enter a valid email.')
            .custom(authValidators.isExistingUser),
        check('password')
            .custom(authValidators.isCorrectPassword),
    ],
    authController.postLogin
)
router.get('/logout', isAuth, authController.logout)
router.get('/signup', authController.getSignUp)
router.post('/signup',
    [   
        check('name')
            .isLength({min: 1}).withMessage('Please enter a valid name.'),
        check('password')
            .isLength({min: 8}).withMessage('Please enter a password with at least 8 chars.')
            .custom(authValidators.isMatchingPasswords),
        check('email')
            .normalizeEmail()
            .isEmail().withMessage('Please enter a valid email.')
            .custom(authValidators.isNotExistingEmail),
        
    ], 
    authController.postSignUp
)
router.get('/add-cash', isAuth, authController.getAddCash)
router.post('/add-cash', 
    [
        isAuth,
        check('cash').isNumeric().withMessage('Enter a valid number!')
    ], 
    authController.postAddCash
)






export default router;