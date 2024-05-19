const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcrypt')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const email = req.body.email
    const plainTextPassword = req.body.password
    const registration_code = req.body.code
    if (registration_code !== process.env.REGISTRATION_SECRET) {
        return res.render('register', { isCodeWrong: true })
    }
    const saltRounds = 10


    const sql = `
    INSERT INTO 
        users (email, password_digest, registration_code)
    VALUES 
        ($1, $2, $3)
    RETURNING
        *;
    `

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) console.log(err);
        
        bcrypt.hash(plainTextPassword, salt, (err, hash) => {
            if (err) console.log(err);

            db.query(sql, [email, hash, registration_code], (err, result) => {
                if (err) {
                    console.log(err);
                }
    
                res.redirect('/login')
            })
        })
    })
   
})

router.post('/login', (req, res) => {
    //1. get the email & password from the request
    const email = req.body.email
    const plainTextPassword = req.body.password

    //2. check if user exists in the database using the email address
    const sql = `
        SELECT *
        FROM users
        WHERE email = $1;
    `

    db.query(sql, [email], (err, result) => {
        if (err) console.log(err)

        if (result.rows.length === 0) {
            console.log('user not found');
            res.render('login', { errorMsg: 'incorrect email or password'})
            return
        }

        //3. check password is valid or not
        const hashedPassword = result.rows[0].password_digest
        bcrypt.compare(plainTextPassword, hashedPassword, (err, isCorrect) => {
            if (err) console.log(err);

            if (!isCorrect) {
                console.log('password No match');
                return res.render('login', { errorMsg: 'incorrect email or password'})
            }

            //4. yay - its time to create a session for this user
            req.session.userId = result.rows[0].id



            res.redirect('/dashboard')
        })

    })
})

router.delete('/logout', (req, res) => {
    req.session.userId = null
    res.redirect('/login')
})



module.exports = router