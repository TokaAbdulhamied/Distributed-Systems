import User from '../models/user.js'
import bcrypt from 'bcryptjs'


export const isAuth = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login')
    }
    next()
}

export const isMatchingPasswords = (value, {req}) => {
    if (value !== req.body.confirmPassword) {
        throw new Error('The two passwords mismatch!')
    }
    return true;
}

export const isNotExistingEmail = (value, {req}) => {
    return User.findOne({where: {
        email: value
    }}).then(user => {
        if (user){
            throw new Error('A user with this email already exists!')
        }
    })
}

export const isExistingUser = (value, {req}) => {
    return User.findOne({where: {
        email: value
    }}).then(user => {
        if (!user){
            throw new Error('No user exists with this email!')
        }
        req.attemptingLoginUser = user
    })
}

export const isCorrectPassword = (value, {req}) => {
    if (!req.attemptingLoginUser) {
        throw new Error('Invalid User')
    }
    return bcrypt.compare(value, req.attemptingLoginUser.password).then(match => {
        if (!match) {
            throw new Error('Invalid password!')
        }
    })

}
 