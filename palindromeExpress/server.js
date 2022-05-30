const express = require('express')
const app = express()
const bodyParser = require('body-parser') // somewhat depricated & built in
const MongoClient = require('mongodb').MongoClient
// what we use to talk to our mongo DataBase - Use MongoDB Atlas 

var db, collection;

// set DB as a variable - please connect your own DB or reach out if you'd like to use mine

const url = "mongodb+srv://username:<password>@cluster0.v4oii.mongodb.net/?retryWrites=true&w=majority"
const dbName = ""

// API --> listening and generating a response.
// line 15-22 sets up mongo database
app.listen(8000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

//Middle Wares (as shown in CRUD article)
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
// public folder and when we request it express handles it for us

// GET request -> '/' = main route/root -> here's the function/code that's going to run [Read (GET)- Get something]

app.get('/', (req, res) => {
  // name of array is result inside this scope
  db.collection('palMessage').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {pal: result})

    // respond with the rendering of our ejs (we've passed all of our array/objects into messages)..which ejs responds with HTML and includes all the content we got back from out database

    // ejs is a templating language -> job is to have a template that we plug data into and then gives us an HTML file that displays to the user. 
    // can't build out data if we hardcode out HTML 
  })
})


// POST Request [send data to a server to create/update a resource] -> '/' = main route/root -> here's the function/code that's going to run
// we want data stored in the DataBase (used to send data to the server)
// go to DB -> find message collection -> insert one (insertOne) document -> request sends a lot of data -> 

app.post('/palindromeCheck', (req, res) => {
  
  let palResult = req.body.fullWord.toLowerCase() === req.body.fullWord.toLowerCase().split('').reverse().join('') ? 'is a palindrome! Great work!' : 'is not a palindrome. Try again!'
   // result for palindrom grabbing from body in ejs (the form action) - ternary (conditional) if a palindrom it'll be 'this is a...' if not it'll be 'try again' 
  
  // - evaluates to a Boolean value, either true or false

  db.collection('palMessage').insertOne({word: req.body.fullWord.toLowerCase(), results: palResult}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
    // redirect refreshes and triggers new GET request and there will be a new document. Get and post work together. Going to palMessage DB collection and insert a new document into the collection.
  })
})

// from the first palindrome:

  // let wordPal = word.toLowerCase().split('').reverse().join('')

  // if (word.toLowerCase() === wordPal) {
  //   conclusion = 'Yes! This is a Palindrome'
  // } else {
  //   conclusion = 'This is NOT what we want! Try again'
  // }



  // DELETE request [Remove something] - trash can to delete messages
// The req. body object allows you to access data in a string or JSON object from the client side. use to receive data through POST and PUT requests in the Express server.

app.delete('/palMessage', (req, res) => {
  db.collection('palMessage').findOneAndDelete({word: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
