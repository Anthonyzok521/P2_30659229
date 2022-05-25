'use strict'
const { verify } = require('crypto');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = require('isomorphic-fetch');
const data = path.join(__dirname, "data", "db.db");
const database = new sqlite3.Database(data, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Database conected");
  }
});
const create = "CREATE TABLE IF NOT EXISTS contacts(name VARCHAR(50), email VARCHAR(50), message TEXT, date DATETIME, time VARCHAR(20), ip VARCHAR(50), country VARCHAR(120));";
require('dotenv').config();
const sendmail = require('../public/javascripts/sendMail');

let response_cap = "null";

database.run(create, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Table created");
  }
});


router.get('/', (req, res, next) => {
  res.render('index.ejs',{data:{},
  res_cap:response_cap,
  API_KEY:process.env.API_KEY,
  CAPTCHA_KEY:process.env.CAPTCHA_KEY,
  ANALITYCS_KEY:process.env.ANALITYCS_KEY});
});

router.get('/contacts', (req, res, next) => {
          const query = "SELECT * FROM contacts;";
          database.all(query, [], (err, rows) => {
            if(err){
              return console.error(err.message);
            }
            else{
              res.render("contacts.ejs", {data:rows});
            }
          });
});

router.post('/', (req, res) => {

  let ip = req.headers['x-forwarded-for'];
  let dt = new Date();
  let time = ""
  if(dt.getHours() >= 12){
    time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + " PM";
  }
  else{
    time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + " AM";
  }
  let _date = dt.toLocaleString();
  let date = "";


  for(let d = 0; d <= 9; d++){
      if(_date[d] == '/'){
        date += '-';
        continue;
      }
      else if(_date[d] == ','){
        continue;
      }
      date += _date[d];
  }

  if(ip){
    let ip_ls = ip.split(',');
    ip = ip_ls[ip_ls.length - 1];
  }
  else{
    console.log('IP adress not found');
  }
  
  const query = "INSERT INTO contacts(name, email, message, date, time, ip, country) VALUES (?,?,?,?,?,?,?);";
	const messages = [req.body.name, req.body.email, req.body.message, date, time, ip, req.body.country];
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${req.body['g-recaptcha-response']}`;

  fetch(url, {
      method: "post",
    })
    .then((response) => response.json())
    .then((google_response) => {
      if (google_response.success == true) {
        database.run(query, messages, (err)=>{
          if (err){
            return console.error(err.message);
          }
          else{
            console.log("A user has commented");
          }
        });
        sendmail.Send(req.body.name, req.body.email, ip, req.body.country, date, time, req.body.message);
          response_cap = "null";
          res.set({res_cap:response_cap});
          res.redirect('/');

    } else {
      console.log("ERROR TO THE VERIFY THE reCAPTCHA");
      response_cap = "false";
      res.set({res_cap:response_cap});
      res.redirect('/');
    }
    })
    .catch((error) => {
    
    console.log(error);
  });
});

module.exports = router;
