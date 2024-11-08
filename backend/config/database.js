const mongoose = require('mongoose')

const dbConnect = () => {
    const db_uri = process.env.DB_URI
    mongoose.set('strictQuery', false)
    mongoose.connect(db_uri)
    console.log('Connected to MongoDB database '+db_uri)
}

module.exports = dbConnect
