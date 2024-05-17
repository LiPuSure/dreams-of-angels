const express = require('express')
const router = express.Router()
const OpenAI = require("openai")
const db = require('../db')
const cloudinary = require('cloudinary').v2
const setCurrentBook = require('../middlewares/set_current_book')
let textToChatgpt
let textFromChatgpt

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
    textToChatgpt = ''
    textFromChatgpt = ''
    const timestamp = new Date()
    const sql = `
    INSERT INTO dream_books (title, date)
    VALUES ($1, $2)
    RETURNING *;
    `
    db.query(sql, ['untitled', timestamp], (err, result) => {
        if (err) console.log(err);

        const dreambook = result.rows[0]
        req.session.bookId = Number(dreambook.id)
        res.render('start_point', {bookId: req.session.bookId})
    })

})

router.get('/dreams/new/stage/:id', (req, res) => {
    const stageId = Number(req.params.id)
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
    if (stageId === 1) {
        textFromChatgpt = 'I need you to generate 5 img for me.  The 5 images will make up a story. I will give you settings and requirements one by one. Please connect all the information and background together for all 5 images. '
    }
    textToChatgpt = textFromChatgpt + ' ' +inputText
    async function getResponse () {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${textToChatgpt}`,
        n: 1,
        size: "1024x1024",
      });
      const imageUrl = response.data[0].url;
      textFromChatgpt = textFromChatgpt + ` The previous messages are "${response.data[0].revised_prompt}". Now given the previous messages, please generate the next image for me.`
      return imageUrl
  
    }
    const imageResponse = await getResponse()

    cloudinary.uploader.upload(imageResponse, {folder: "angel-database-images"}).then((file) => {
        const sql = `
        INSERT INTO dreams (image_url, inputText, story_order, book_id, user_id)
        VALUES ($1, $2, $3, $4, $5);
        `
        db.query(sql, [file.url, inputText, stageId, req.session.bookId, req.session.userId], (err, result) => {
            if (err) console.log(err);
            
            if (stageId < 5) {
                res.redirect(`/dreams/new/stage/${stageId+1}`)
            } else {
                res.redirect(`/dreams/present/${req.session.bookId}?direct_from=edit`)
            }
        })
    });
})

router.get('/dreams/present/:id', (req, res) => {
    const directFrom = req.query.direct_from
    const currentBookId = req.params.id
    const sql = `
    SELECT * FROM dreams WHERE book_id = $1;
    `
    db.query(sql, [currentBookId], (err, result) => {
        if (err) console.log(err);
        const dreams = result.rows
        res.render('show', {dreams: dreams, directFrom: directFrom})
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

router.get('/dreams/search', (req, res) => {
   res.render('search')
})

router.post('/dreams/search', (req, res) => {
    const bookTitle = req.body.title
    const sql = `
    SELECT * FROM dream_books
    JOIN dreams
    ON ( dream_books.id = dreams.book_id )
    WHERE title ILIKE $1
    AND story_order = 1
    ;
    `
    db.query(sql, [`%${bookTitle}%`], (err, result) => {
        if (err) console.log(err);
        const dreambooks = result.rows
        res.render('searchList', {dreambooks: dreambooks})
    })
})

router.delete('/dreams/book/:id', (req, res) => {
    const sql = `
    DELETE FROM dream_books
    WHERE id = $1;
    `
    db.query(sql, [req.params.id], (err, result) => {
        if (err) console.log(err);
        res.redirect('/dashboard')
    })
})

module.exports = router