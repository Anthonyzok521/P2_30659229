const express = require("express")
const app = express()

app.get('/', function(res, req){

	res.send("LOL")
})
app.listen(process.env.PORT || 5000)
