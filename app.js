const express = require('express')
const uuid = require('uuid')
const app = express()

app.use(express.json())
const rooms = []

//class structure for a room
class Room {
  constructor(id, seats, amenities, price) {
    this.id = id
    this.name = 'Room no : ' + id
    this.seats = seats
    this.amenities = amenities
    this.price = price
    this.customer = []
    this.date = []
    this.startTime = []
    this.endTime = []
    this.status = 'unbooked'
  }
}

//post request for creating a room with unique id
app.post('/room', (req, res) => {
  //if input absent throw error
  if (!(req.body['seats'] && req.body['amenities'] && req.body['price']))
    return res.status(400).json({ ErrorMessage: 'Provide proper input' })
  let room = new Room(
    uuid.v4(),
    req.body['seats'],
    req.body['amenities'],
    req.body['price']
  )
  rooms.push(room)
  res.status(200).json({ room })
})

//get all the rooms data
app.get('/rooms', (req, res) => {
  res.status(200).json({ rooms })
})

//get all customers data
app.get('/customers', (req, res) => {
  let customers = []
  rooms.forEach((room, i) => {
    if (room.status == 'booked') {
      for (let j = 0; j < room.customer.length; j++)
        customers.push({
          name: room.customer[j],
          room: room.name,
          date: room.date[j],
          startTime: room.startTime[j],
          endTime: room.endTime[j],
        })
    }
  })
  res.status(200).json({ customers })
})

//update the room info and stack bookings in array
app.put('/bookroom/:id', (req, res) => {
  let room = rooms.find((val) => val.id == req.params.id)
  console.log(room)
  let i = rooms.indexOf(room)
  //if room not present throw error
  if (!room) return res.status(400).json({ ErrorMessage: 'room not found' })

  //if query input absent throw error
  //assumption:date in dd/mm/yyyy format and time in hh:mm format
  if (!(req.query.name && req.query.date && req.query.start && req.query.end))
    return res.status(400).json({ ErrorMessage: 'Provide proper input' })

  //logic to check if there is no time overlap while booking
  if (room.status == 'booked') {
    let date = req.query.date.split('/')
    let starttime = req.query.start.split(':')
    let a = +starttime[0] + +starttime[1] / 60
    let endtime = req.query.end.split(':')
    let b = +endtime[0] + +endtime[1] / 60

    for (let j = 0; j < room.customer.length; j++) {
      let refdate = room.date[j].split('/')
      let refstarttime = room.startTime[j].split(':')
      let x = +refstarttime[0] + +refstarttime[1] / 60
      let refendtime = room.endTime[j].split(':')
      let y = +refendtime[0] + +refendtime[1] / 60

      if (
        +date[0] == +refdate[0] &&
        +date[1] == +refdate[1] &&
        +date[2] == +refdate[2]
      )
        if (
          (a >= x && a < y) ||
          (b > x && b <= y) ||
          (a <= x && b >= y) ||
          (a >= x && b <= y)
        )
          return res.status(400).json({ ErrorMessage: 'Time slot occupied' })
    }
  }
  rooms[i].customer.push(req.query.name)
  rooms[i].date.push(req.query.date)
  rooms[i].startTime.push(req.query.start)
  rooms[i].endTime.push(req.query.end)
  rooms[i].status = 'booked'
  res.status(200).json({ room: rooms[i] })
})

const PORT = process.env.PORT || 8000

app.listen(PORT)
