const express = require('express')
const router = express.Router()
const OpenAI = require("openai")
const db = require('../db')
const cloudinary = require('cloudinary').v2
const setCurrentBook = require('../middlewares/set_current_book')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECERT
})

router.use(setCurrentBook)

router.get('/dreams/new_book', (req, res) => {
    res.render('new_book')
})

router.get('/dreams/new/start_point', (req, res) => {
    const timestamp = new Date()
    const sql = `
    INSERT INTO dream_books (title, date)
    VALUES ($1, $2)
    RETURNING *;
    `
    db.query(sql, [timestamp, timestamp], (err, result) => {
        if (err) console.log(err);

        const dreambook = result.rows[0]
        req.session.bookId = Number(dreambook.id)
        res.render('start_point', {bookId: req.session.bookId})
    })

})

router.get('/dreams/new/stage/:id', (req, res) => {
    const stageId = Number(req.params.id)
    console.log(stageId);
    if (stageId === 1) {
        res.render('new', {stage: stageId, dreams: []})
    } else {
        const sql = `
        SELECT * FROM dreams WHERE book_id = $1;
        `
        db.query(sql, [req.session.bookId], (err, result) => {
            if (err) console.log(err);
            const dreams = result.rows
            res.render('new', {stage: stageId, dreams: dreams})
        })
    }
})

router.post('/dreams/new/stage/:id', async (req, res) => {
    const stageId = Number(req.params.id[0])
    const inputText = req.body.content
    console.log(inputText);
    async function getResponse () {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${inputText}`,
        n: 1,
        size: "1024x1024",
      });
      const imageUrl = response.data[0].url;
      return imageUrl
  
    }
    const imageResponse = await getResponse()

    cloudinary.uploader.upload(imageResponse, {folder: "angel-database-images"}).then((file) => {
        console.log(file);
        const sql = `
        INSERT INTO dreams (image_url, inputText, story_order, book_id)
        VALUES ($1, $2, $3, $4);
        `
        db.query(sql, [file.url, inputText, stageId, req.session.bookId], (err, result) => {
            if (err) console.log(err);
            
            if (stageId < 5) {
                res.redirect(`/dreams/new/stage/${stageId+1}`)
            } else {
                res.redirect('/dreams/present')
            }
        })
    });
})

router.get('/dreams/present', (req, res) => {
    const sql = `
    SELECT * FROM dreams WHERE book_id = $1;
    `
    db.query(sql, [req.session.bookId], (err, result) => {
        if (err) console.log(err);
        const dreams = result.rows
        res.render('show', {dreams: dreams})
    })
})

router.put('/dreams/book_title', (req, res) => {
    const title = req.body.title

    const sql = `
    UPDATE dream_books
    SET title = $1
    WHERE id = $2;
    `
    db.query(sql, [title, req.session.bookId], (err, result) => {
        if (err) console.log(err);
        res.redirect('/')
    })

})



module.exports = router