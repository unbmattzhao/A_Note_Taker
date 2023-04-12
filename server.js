// import required modules and initializes constants, variables and the Express application.
const express = require('express')
const fs = require('fs')

const { readFromFile, readAndAppend } = require('./helpers/file')
const uuid = require('./helpers/uuid');
const db = require('./db/db.json');
// const { log } = require('console');
// const { stringify } = require('querystring');


const PORT = process.env.PORT || 3001

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))


//sets up a route to serve the "notes.html" file when the "/notes" path is requested via a GET request
app.get('/notes', (req, res)=>{
    res.sendFile(`${__dirname}/public/notes.html`)  
})

// sets up a route to retrieve and return all notes from the database file "/db/db.json" when a GET request is made to "/api/notes" path. 
//uses the helper function readFromFile to read the contents of the database file and parse it to a JSON object to be returned as a response.
app.get('/api/notes', (req, res)=>{
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
})

//sets up a route to handle a POST request to create a new note.  
app.post('/api/notes', (req, res)=>{
    console.info(`${req.method} request received to add a new note`)
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text ) {
      // Variable for the object we will save
      const newNote = {
        title,
        text,
        id:uuid(),
      }

      readAndAppend(newNote, './db/db.json');
  
      const response = {
        status: 'success',
        body: newNote,
      }
  
      console.log(response);
      res.status(201).json(response);
    } else {
      res.status(500).json('Error in posting a new note');
    }

})

// sets up a route to handle a DELETE request to remove a note from the database. 
app.delete(`/api/notes/:id`, (req, res)=>{
    const id = req.params.id;
    const noteToDelete = db.find(el => el.id === id);
    if (!noteToDelete) {
       return res.status(404).json({ error: 'Note not found' });
    }
    const filteredNotes = db.filter(note => note.id !== id);

    fs.writeFile(`${__dirname}/db/db.json`, JSON.stringify(filteredNotes, null, 4), (err)=>{
       if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete note' });
       }
       console.log(`Note with ID ${id} deleted`);
       res.json({ message: 'Note deleted successfully' });
    });
 })
 
// sets up a get request for all other routes as requested.
app.get('*', (req, res)=>{
    res.sendFile(`${__dirname}/public/index.html`)
    
})

// listening the port
app.listen(PORT, ()=>
{
    console.log(`Sever started, listening on PORT: ${PORT}!`);
})