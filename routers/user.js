const express = require('express')
const bcryptjs = require('bcryptjs')
// const DbProduct = require('../model/Product')
const DbUser = require('../model/User')
const multer = require('multer')
const path = require('path')
const passport = require('passport')
const router = express.Router()



const storage = multer.diskStorage({
    destination : (req, file , cd) => {
        cd(null, 'uploads')
    },
    filename: (req, file , cb) => {
        cb(null, Math.random().toString() + path.extname(file.originalname) ) // 12321.jpg
    }
})

const uploads = multer({
    storage,
    limits : {fieldSize : 2 * 1024 * 1024 },
    fileFilter : (req, file , cb) => {
        const extname = path.extname(file.originalname)
        if(extname !== '.jpg' &&  extname !== '.jpeg'  && extname !== '.png'){
            const err = new Error('xatolik bor')
            err.code = 404
            return cb(err)
        }
        cb(null, true)

    },
    preservePath : true,

}).single('photos')



router.get('/account/acc', (req, res) => {
    res.render('register', {
        title: 'Royhatdan otish sahifasi',
    })
})

 
router.post('/account/acc' , uploads ,  (req  ,res) => {
 
    req.checkBody('name' , 'Ismingizni kiriting bosh qolishi mumkin emas').notEmpty()
    req.checkBody('phone' , 'Telefon raqamingizni kiriting bosh qolishi mumkin emas').notEmpty()
    req.checkBody('username' , 'Login kiriting bosh qolishi mumkin emas').notEmpty()
    req.checkBody('password' , 'Parolingizni kiriting bosh qolishi mumkin emas').notEmpty()
    req.checkBody('password2' , 'Parolingizni qaytadan kiriting bosh qolishi mumkin emas').equals(req.body.password)
    req.checkBody('email' , 'Emailngizni kiriting bosh qolishi mumkin emas').notEmpty()
     
    
    const errors =  req.validationErrors()
    if(errors){
        res.render('register' , {
            title: 'Error',
            errors : errors
        })
    } else{
        const db  = new DbUser({
            name : req.body.name,
            phone : req.body.phone,
            username : req.body.username,
            password : req.body.password,
            email : req.body.email,
            photo : req.file.path
        })
    
    bcryptjs.genSalt(10 , (err , pass) => {
        bcryptjs.hash(db.password , pass , (err , hash) => {
            if(err){
                console.log(err)
            }else{
                db.password = hash
                db.save((err) => {
                    if(err)
                        throw err
                    else{
                        req.flash('success' , 'Royhatdan muvoffiqiyatli otdingiz')
                        res.redirect('/login/log')
                    }
                })
            }

        })

    })

       
    }

})



//// isAuthed
router.get('/login/log' ,     (req  ,res) => {
    res.render('login' , {
        title: "Login sahifasi"
    })
    
})

router.post('/login/log' ,     (req  ,res ,next) => {
   
         passport.authenticate('local', {
         successRedirect: '/',
         failureRedirect: '/login/log',
         failureFlash: 'Username va Parolda xatolik bor',
         successFlash: "Xush kelibsiz! Tizimga kirdingiz"
        
        })(req  ,res ,next)
})


 




            module.exports = router