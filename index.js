const express = require("express");
const app = express();
const path = require("path");

app.get('/', (req, res)=>{

	res.sendFile('__dirname + "/index.html');
});
app.listen(process.env.PORT || 5000);
