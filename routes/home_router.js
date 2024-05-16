const express = require('express')
const router = express.Router()
const db = require('../db')
const _ = require('lodash')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')

router.get('/', (req, res) => {
    const sql = `
    SELECT * FROM dream_books
    JOIN dreams
    ON ( dream_books.id = dreams.book_id )
    WHERE story_order = $1
    ;
    `
    db.query(sql, [1],(err, result) => {
        if (err) console.log(err);

        const dreambooks = result.rows
        let randomCovers = _.sampleSize(dreambooks, 3)
        res.render('home', { dreambooks: randomCovers})
    })

})

router.get('/dashboard', ensureLoggedIn, (req, res) => {
    const sql = `
    SELECT * FROM dream_books
    JOIN dreams
    ON ( dream_books.id = dreams.book_id )
    WHERE user_id = $1
    ;
    `
    db.query(sql, [req.session.userId], (err, result) => {
        if (err) console.log(err);

        const dreambooks = result.rows
        res.render('home', { dreambooks: dreambooks})
    })

})






module.exports = router