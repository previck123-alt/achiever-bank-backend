require('dotenv').config()
const app = require('express')();
const express = require('express')
require('dotenv').config()
app.use(express.static("public"));
app.use("/", express.static("public"));
const cors = require("cors")
const bodyParser = require("body-parser")
app.use(bodyParser.json())

////setting express to use  the session
app.use(cors())
app.use(bodyParser.json())

const userRoutes = require("./routes/user")
const adminRoutes = require("./routes/admin")
//using the routes
app.use(adminRoutes.router)
app.use(userRoutes.router)

//error handler //express error middleware
app.use((err, req, res, next) => {
  console.log(err.message)
  err.statusCode = err.statusCode || 300
  return res.status(err.statusCode).json({
    response:err.message
  })
})


app.listen(process.env.PORT || 8082, (err) => {
  console.log("sucessfully running on port 8080")
})