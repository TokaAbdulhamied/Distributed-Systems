import express from 'express'
import bodyParser from 'body-parser'
import adminRoutes from './routes/admin.js'
import shopRoutes from './routes/shop.js'
import authRoutes from './routes/auth.js'
import errorsController from './controllers/errors.js'
import path from 'path'
import db from './db/index.js'
import User from './models/user.js'
import createDataBaseRelations from './models/relations.js'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import csrf from 'csurf'
import flash from 'connect-flash'
import multer from 'multer'
import crypto from 'crypto'
import cors from 'cors'


const __dirname = path.resolve()
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      cb(null, crypto.randomBytes(16).toString('hex') + '-' + file.originalname)
    }
  })
function fileFilter (req, file, cb) {
 
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        return cb(null, true)
    }
    cb(null, false)   
}
  
const csrfProtection = csrf()
const app = express();
const postgresSession = new connectPgSimple(session)
const store = new postgresSession({
    conString: "postgres://omar:917356Oo@localhost:5432/node-complete"
})

app.set('view engine', 'ejs');
app.set('views', './views')

app.use(cors());

app.use(express.static(path.join(__dirname, './public')));

app.use(bodyParser.urlencoded({extended: false}))

app.use(multer({storage: fileStorage, fileFilter}).single('image'))

app.use(session({
    store,
    secret: "917356Oo",
    resave: false,
    saveUninitialized: false
}))

app.use(csrfProtection)

app.use(flash())

app.use((req, res, next) => {
    if(req.session.isAuthenticated){
        User.findByPk(req.session.user)
        .then(user => {
            req.user = user
            console.log(req.user)
            next()
        })
        .catch(error => {
            console.log(error)
        })
    }
    else {
        next()
    }    
})

app.use((req, res, next) => {
    if (req.session.isAuthenticated) {
        res.locals.isAuthenticated = req.session.isAuthenticated
        res.locals.user = req.user
    } else {
        res.locals.isAuthenticated = undefined
        res.locals.user = undefined
    }
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)
app.use(errorsController.get404)
app.use((error, req, res, next) => {
    console.log(error.message)
    if(error.message === 'Not enough cash!') {
        return res.render('auth/add-cash', {
            errorMssg: 'Not enough cash please add cash first',
            path: '/add-cash',
            pageTitle: 'Add Cash',
            isAuthenticated: req.session.isAuthenticated
        })
    }
    res.render('500', {
        pageTitle: '500 Error',
        path: '500',
        isAuthenticated: req.session.isAuthenticated
    })
})


createDataBaseRelations()


db.sync()
    .then(res => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })

