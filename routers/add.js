const express = require('express')
const DbProduct = require('../model/Product')
const multer = require('multer')
const path = require('path')
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

}).single('photo')

router.get('/add' , (req  ,res) => {
        res.render('add' , {
        title: 'Mahsulot qoshish sahifasi',

    })
})

router.post('/add' , uploads ,  (req  ,res) => {
    req.checkBody('title' , 'Mahsulotning nomi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('price' , 'Mahsulotning narxi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('category' , 'Mahsulotning categorysi bosh qolishi mumkin emas').notEmpty()
    req.checkBody('comments' , 'Mahsulotning comments bosh qolishi mumkin emas').notEmpty()
     
    
    const errors =  req.validationErrors()
    if(errors){
        res.render('add' , {
            title: 'Error',
            errors : errors
        })
    } else{
        const db  = new DbProduct({
            title : req.body.title.toLowerCase(),
            price : req.body.price,
            category : req.body.category,
            comments : req.body.comments,
            sale : req.body.sale,
            photo : req.file.path
        })
        db.save((err) => {
            if(err)
                throw err
            else{
                req.flash('success' , 'Maxsulot qoshildi')
                res.redirect('/')
            }
        })
    }

})




// router.post('/product/edit/:userId' , uploads ,  (req  ,res) => {
//     req.checkBody('title' , 'Mahsulotning nomi bosh qolishi mumkin emas').notEmpty()
//     req.checkBody('price' , 'Mahsulotning narxi bosh qolishi mumkin emas').notEmpty()
//     req.checkBody('category' , 'Mahsulotning categorysi bosh qolishi mumkin emas').notEmpty()
//     req.checkBody('comments' , 'Mahsulotning comments bosh qolishi mumkin emas').notEmpty()    
//     const errors =  req.validationErrors()
//     if(errors){
//         res.render('add' , {
//             title: 'Error',
//             errors : errors
//         })
//     } else{
//         const db  =  {
//             title : req.body.title.toLowerCase(),
//             price : req.body.price,
//             category : req.body.category,
//             comments : req.body.comments,
//             photo : req.file.path  
//         }
//         const ids = {_id : req.params.userId }
//         DbProduct.updateOne(ids , db , (err) => {
//             if(err){
//                 console.log(err)
//             }else{
//             req.flash('success' , 'Maxsulot qoshildi')
//             res.redirect('/')
//         }
//         })
       
//     }

// })

 
 
module.exports  = router