import fs from 'fs'


export const passError = (error, next) => {
    if(!error.statusCode) {
        error.statusCode = 500
        error.message = "Oops something went wrong!"
    }
    next(error)
}

export const deleteFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            throw err
        }
    })
}