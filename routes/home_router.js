const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res) => {
    const sql = `
    SELECT * FROM dreams;
    `
    db.query(sql, (err, result) => {
        if (err) console.log(err);

        const dreams = result.rows
        console.log(dreams);
        res.render('home', { dreams: dreams})
    })

})






module.exports = router