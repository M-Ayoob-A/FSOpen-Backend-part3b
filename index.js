const express = require('express')
const app = express()
const morgan = require('morgan')
//const cors = require('cors')
const Person = require('./models/person')
require('dotenv').config()

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body)
})

//app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.statusMessage = "Could not find the person with the specified id"
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  let person = request.body
  if (!(person.name && person.number)) {
    response.status(400).end("{ error: 'entry must include a name' }")
  } 
  const newperson = new Person({
    name: person.name,
    number: person.number,
  })

  newperson.save()
    .then(newper => {
      response.json(newper)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const number = request.body.number

  Person.findById(request.params.id)
    .then(person => {
      person.number = number

      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {  
  Person.countDocuments({})
    .then(num => {
      response.send(`<p>Phonebook has info for ${num} people</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

// Middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)