const express = require('express')
const router = express.Router()
const OpenAI = require("openai")
const db = require('../db')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        const dreambook = result.rows
        res.render('start_point', { book_id: dreambook.id})
    })

})

router.get('/dreams/new/stage/:id', (req, res) => {
    const sql = `
    UPDATE dreams 
    SET 
    `
    db.query(sql, [timestamp, timestamp], (err, result) => {
        if (err) console.log(err);

        const dreams = result.rows
        res.render('new', {stage: Number(req.params.id), dreams: dreams})
    })

})

router.post('/dreams/new/stage/:id', async (req, res) => {
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
    console.log(imageResponse);

    const sql = `
    INSERT INTO dreams (image_url, inputText, story_order)
    VALUES ($1, $2, $3);
    `
    db.query(sql, [imageResponse, inputText, 1], (err, result) => {
        if (err) console.log(err);


        res.render('show', {imageUrl: imageResponse})
    })

})






module.exports = router