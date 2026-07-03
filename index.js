const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const usersData = {}
let userId = 1
const exerciseLogs = []

// --- Seed data for local testing ---
function seedUser(username) {
  const id = String(userId)
  usersData[id] = username
  userId++
  return id
}

const testUserId1 = seedUser('fcc_test')
const testUserId2 = seedUser('john_doe')

exerciseLogs.push({
  _id: testUserId1,
  username: usersData[testUserId1],
  date: new Date('1990-01-01').toDateString(),
  duration: 60,
  description: 'test run'
})

exerciseLogs.push({
  _id: testUserId1,
  username: usersData[testUserId1],
  date: new Date('1990-02-15').toDateString(),
  duration: 30,
  description: 'cycling'
})

exerciseLogs.push({
  _id: testUserId2,
  username: usersData[testUserId2],
  date: new Date().toDateString(),
  duration: 45,
  description: 'swimming'
})

app.route('/api/users')
  .get((req, res) => {
    const arrUsers = []
    for (key in usersData) {
      arrUsers.push({
        username: usersData[key],
        _id: key
      })
    }
    res.send(arrUsers)
  })
  .post((req, res) => {
    const user = req.body.username
    usersData[userId] = user
    res.json({
      username: user,
      _id: userId
    })
    userId++
  })

app.get('/api/users/:_id/logs', (req, res) => {
  let from = req.query.from // new Date(req.query.from)
  let to = req.query.to
  let limit = parseInt(req.query.limit)
  let logs = exerciseLogs.filter(log => log._id === req.params._id).map(({ description, duration, date }) => ({ description, duration, date }))

  if (from != undefined) {
    from = new Date(from)
    logs = logs.filter(log => new Date(log.date) >= from)
  } else if (to != undefined) {
    to = new Date(to)
    logs = logs.filter(log => new Date(log.date) <= to)
  }

  res.json({
    _id: req.params._id,
    username: usersData[req.params._id],
    count: logs.length,
    log: limit ? logs.slice(0, limit) : logs
  })
})

app.post('/api/users/:id/exercises', (req, res) => {
  const log = {
    _id: req.params.id,
    username: usersData[req.params.id],
    date: (req.body.date ? new Date(req.body.date) : new Date()).toDateString(),
    duration: parseInt(req.body.duration),
    description: req.body.description
  }
  exerciseLogs.push(log)
  res.json(log)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

