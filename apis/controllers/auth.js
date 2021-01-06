import User from '../../models/user.js'
import bcrypt from 'bcryptjs'
import validator from 'express-validator'
import jwt from 'jsonwebtoken'
import {passError} from '../../helpers.js'



const {validationResult} = validator


export const isAuth = async(req, res, next) => {
    try {
        const header = req.get('Authorization')
        if(!header) {
            const error = new Error("No Authorization Header is Supplied!")
            error.statusCode = 401
            throw error
        }
        const [bearer, token] = header.split(' ');
        if(bearer !== 'Bearer' && bearer !== 'bearer') {
            const error = new Error("Token must be a Bearer token")
            error.statusCode = 401
            throw error
        }
        const decodedToken = jwt.verify(token, '917356Oo2411965')
        if(!decodedToken) {
            const error = new Error("Invalid Token!")
            error.statusCode = 401
            throw error
        }
        req.user = await User.findByPk(decodedToken.id)
        next()
    } catch(error) {
        if(!error.statusCode) {
            error.message = "Invalid Token!"
            error.statusCode = 401
        }
        next(error)
        
    }
    
}

export const isNewEmail = (value, {req}) => {
    return User.findAll({where: {
        email: value
    }}).then(users => {
        if(users.length > 0){
            return Promise.reject("A User with this email already exists!")
        }
    })
}



export const login = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    let userData
    User.findOne({where: {
        email
    }}).then((user) => {
        if(!user) {
            const error = new Error('Invalid email and password combination!')
            error.statusCode = 401
            throw error
        }
        userData = user
        return bcrypt.compare(password, user.password)
    }).then((isEqual) => {
        if(!isEqual) {
            const error = new Error('Invalid email and password combination!')
            error.statusCode = 401
            throw error
        }
        const token = jwt.sign({
            id: userData.id,
            name: userData.name,
            email: userData.email,
        }, "917356Oo2411965", {expiresIn: '5h'})
        return res.status(200).json({
            success: true,
            token,

        })
    }).catch((error) => {
        console.log(error)
        passError(error, next)
    })
}
    
export const signUp = (req, res, next) => {
    const errors = validationResult(req)
    let userData;
    if(!errors.isEmpty()) {
        const error = new Error("Validation error!")
        error.statusCode = 422
        error.validators = errors.array();
        throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 12).then((pass) => {
        return User.create({
            name,
            email,
            password: pass
        })
    }).then((user) => {
        userData = user
        return user.createCart()
        
    }).then((cart) => {
        return res.status(201).json({
            success: true,
            id: userData.id,
        })
    }).catch((error) => {
        passError(error, next)
    })
    

}

export const addCash = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error("Validation error!")
        error.statusCode = 422
        error.validators = errors.array();
        throw error;
    }

    req.user.cash = +req.user.cash + +req.body.cash
    req.user.save()
        .then(() => {
            res.status(200).json({
                success: true,
                cash: req.user.cash
            })
        })
        .catch(err => {
            passError(error, next)
        })
}