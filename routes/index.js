var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const data = path.join(__dirname, "data", "db.db");
const database = new sqlite3.Database(data, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Database conected");
  }
});
const create = "CREATE TABLE IF NOT EXISTS contacts(name VARCHAR(50), email VARCHAR(50), message TEXT, date DATETIME, time VARCHAR(20), ip VARCHAR(50));";

database.run(create, err => {
  if(err){
    return console.error(err.message);
  }
  else{
    console.log("Table created");
  }
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

  //VARIBALES

  /*
  * var = PARR CREAR VARIABLES GLOBALES
  * const = PARA CREAR VARIABLES CONSTANTES
  * let = PARA CREAR VARIABLES DE 
  * */

  let datetime = new Date();            // INTANCIANDO EL OBJETO DATE
  let _date = datetime.toLocaleString();  // VARIABLES QUE RECIBEN LA HORA Y FECHA COMPLETA
  let _time = datetime.toLocaleString();
  let date = '';                          // VARAIBLES VACÍA PARA DESPUÉS USARLAS
  let time = '';
  let ip = req.headers['x-forwarded-for'];  // VARIABLE PARA OBTENER LA IP USANDO LA CABECERA DEL SERVIDOR

  // BUCLES

  for(let d = 0; d <= 9; d++){  // LA UTILIDAD QUE TIENE ES RECORRER LA POSICIÓN DE LAS VARIABLES _date y _time
      if(_date[d] == '/'){      // CONDICIÓN QUE VERIFICA SI HAY UNA BARRA DIAGONAL PARA CAMBIARLA POR UN GUIÓN
        date += '-';
        continue;
      }
      else if(_date[d] == ','){ // SI HAY UNA COMA SE ELIMINA
        continue;
      }
      date += _date[d];         // TODO VALOR QUE SE ENCUENTRE EN DICHA POSICIÓN SE LE AGREGA A LA VARIABLE date
  }

  for(let t = 11; t <= 23; t++){ // RECORRE LA HORA
    time += _time[t];
  }

  if(ip){
    let ip_ls = ip.split(',');
    ip = ip_ls[ip_ls.length - 1];
    
  }
  else{
    console.log('IP adress not found');
  }

  console.log(ip);

  // AQUI SON LAS CONSULTAS
  const query = "INSERT INTO contacts(name, email, message, date, time, ip) VALUES (?,?,?,?,?,?);";

  // LOS NOMBRES DE LOS INPUTS DEL HTML
	const messages = [req.body.name, req.body.email, req.body.message, date, time, ip];

	database.run(query, messages, (err)=>{
	if (err){
		return console.error(err.message);
	}
	else{
		res.redirect("/");
    console.log("A user commented");
	}
	});
          
});

router.get('/', (req, res, next) => {
  res.render('index.ejs',{data:{}});
});

module.exports = router;
