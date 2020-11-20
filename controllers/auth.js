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
        return res.status(400).render('auth/login.ejs', {
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
        console.log(err);
        res.redirect('/')
    })
    
}

export const logout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
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
        console.log(errors.array())
        return res.status(400).render('auth/signup', {
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
        }).then(user => {
            user.createCart()
        }).then(() => {
            res.redirect('/login')
        }).catch(err => {
            console.log(err)
        })
    })    
    

}