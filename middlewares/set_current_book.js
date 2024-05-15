const db = require('../db')


function setCurrentBook(req, res, next) {
    
    res.locals.currentBook = {}
    if  (!req.session.bookId) {
        return next()
    }

    const sql =`
        SELECT * FROM dream_books WHERE id = $1;
    `

    db.query(sql, [req.session.bookId], (err, result) => {
        if (err) console.log(err);

        let book = result.rows[0]


        res.locals.currentBook = book
        next()
    })
}

module.exports = setCurrentBook