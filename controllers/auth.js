import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import validator from 'express-validator'

const {validationResult} = validator


export const isAuth = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login')
    }
    next()
}

export const getLogin = (req, res, next) => {
    res.render('auth/login.ejs', {
        pageTitle: "Login",
        path: "/login",
        errorMssg: req.flash('error')
    })
}

export const postLogin = (req, res, next) => {
    const {email} = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login.ejs', {
            pageTitle: "Login",
            path: "/login",
            errorMssg: errors.array()[0].msg,
            oldInput: {
                email
            }
        })
    }
    req.session.isAuthenticated = true
    req.session.user = req.attemptingLoginUser.id
    return req.session.save(err => {
        if (err){
            return next(err);
        }
        
        res.redirect('/')
    })
    
}

export const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err){
            return next(err)
        }
        res.redirect('/login')
    })
}

export const getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        errorMssg: req.flash('error')
    })
}

export const postSignUp = (req, res, next) => {
    const {name, email, password} = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Sign Up',
            errorMssg: errors.array()[0].msg,
            oldInput: {
                name,
                email,
            }
        })
    }
    bcrypt.hash(password, 12).then(hashedPassword => {
        User.create({
            name,
            email,
            password: hashedPassword,
            isAdmin: email === 'admin@shop.com'
        }).then(user => {
            user.createCart()
        }).then(() => {
            res.redirect('/login')
        }).catch(err => {
            next(err)
        })
    })    
    

}

export const getAddCash = (req, res, next) => {
    return res.render('auth/add-cash', {
        path: '/add-cash',
        pageTitle: 'Add Cash!'
    })
}

export const postAddCash = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('auth/add-cash', {
            path: '/add-cash',
            pageTitle: 'Add Cash!',
            errorMssg: errors.array()[0].msg
        })
    }
    req.user.cash = +req.user.cash + +req.body.cash
    req.user.save()
        .then(() => {
            res.redirect('/')
        })
        .catch(err => {
            next(err)
        })
}