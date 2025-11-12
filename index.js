const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

function getNewID() {
  return Math.floor(Math.random() * 1000000);
}

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.statusMessage = "Could not find the person with the specified id"
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  let person = request.body
  if (!(person.name && person.number)) {
    response.status(400).end("{ error: 'entry must include a name' }")
  } else if (persons.find(p => p.name === person.name)) {
    response.status(400).end("{ error: 'name must be unique' }")
  } else {
    person.id = getNewID()
    persons = persons.concat(person)
    response.status(204).end()
  }
  
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {  
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)