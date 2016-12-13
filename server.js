//Modulos requeridos en el server 
const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
const csv = require('fast-csv');
const csv2 = require('fast-csv');
const validador = require("./ElectricArea.js");
const detecIncendio = require("./fireCloseness.js");
const request = require("request");
const stormpath = require('express-stormpath');
const engines = require('consolidate');





app.use(bodyParser.urlencoded({extended: true}))

//para utilizar el ejs
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/'));


var db

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '71f552bb',
  apiSecret: '63a9fefb1345d159'
});

app.use(stormpath.init(app, {
  expand: {
    customData: true
  }
}));
 

 
app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
});
 


//Leer el archivo
app.get('/sms', function(req, res) {
	nexmo.message.sendSms(
	  1234, 56945910573, 'esta es una prueba2',
	    (err, responseData) => {
	      if (err) {
	        console.log(err);
	      } else {
	      	console.dir(responseData);
	        nexmo.message.sendSms(
			  1234, 56998804762, 'esta es una prueba FER2',
			    (err, responseData) => {
			      if (err) {
			        console.log(err);
			      } else {
			        console.dir(responseData);
			      }
			    }
			 ); 
	      }
	    }
	 );


	
})


//Leer el archivo
app.get('/lectura', function(req, res) {

	db.collection('FirePoints').remove();
	var lineaElectrica=[];
	var lineasElectricas = [];
	var cerca = false;
	var date =  new Date().toLocaleString();

	csv
	 .fromPath("./data/coordenadas.csv", {headers: true})
	 .on("data", function(data1){
	 	  
	 	 
	      lineasElectricas.push([Number(data1.Case), 
	      							Number(data1.LatitudA),
	      							Number(data1.LongitudA), 
	      							Number(data1.LatitudB), 
	      							Number(data1.LongitudB), 
	      							Number(data1.LatitudC), 
	      							Number(data1.LongitudC), 
	      							Number(data1.LatitudD), 
	      							Number(data1.LongitudD)]);


	 })
	 .on("end", function(){
	     console.log("Termine de leer lineas Electricas");
	     //console.log(lineasElectricas);
	     

	     //empiezo con la validacion de los puntos 
	     csv
			 .fromPath("MODIS_C6_South_America_24h.csv", {headers: true})
			 .validate(function(data){
			 	var puntos = [Number(data.latitude), Number(data.longitude)];
			 	var enZona = validador.ValidarZona(puntos);
			 	if (enZona){
			 		cerca = detecIncendio.IncendioCercano(puntos, lineasElectricas);
			 		if (cerca){
			 			console.log('Encontre 1 cerca');
			 			data.cercano = 1;
			 			console.log(data);

			 			nexmo.message.sendSms(
						  1234, 56945910573, 'Incendio detectado Latitud =' + data.latitude + ' longitud =' + data.longitude + ' Fecha: ' + date,
						    (err, responseData) => {
						      if (err) {
						        console.log(err);
						      } else {
						      	console.dir(responseData); 
						      }
						    }
						 );

			 			nexmo.message.sendSms(
						  1234, 56998804762, 'Incendio detectado Latitud =' + data.latitude + ' longitud =' + data.longitude + ' Fecha: ' + date,
						    (err, responseData) => {
						      if (err) {
						        console.log(err);
						      } else {
						        console.dir(responseData);
						      }
						    }
						 );



			 		}
			 		else{
			 			console.log('no esta cerca');
			 			data.cercano = 0;
			 		}
			 		return true;
			 	}
			 	else {
			 		return false;
			 	}
			 	return enZona;
		 	 })
			 .on("data", function(data){
			     db.collection('FirePoints').save(data, (err, result) => {
				    if (err) return console.log(err)

				    //console.log('saved to database')
				    //res.redirect('/')
				  })
			 })
			 .on("end", function(){
			     console.log("done");
			     res.redirect('/mapa');
			 });
	     
	 });
  
	


})

app.get('/', stormpath.getUser, function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});


//para ver los puntos.
app.get('/mapa', (req, res) => {
  db.collection('FirePoints').find().toArray((err, result) => {
    if (err) return console.log(err)


    request("http://api.wunderground.com/api/ac6084d23fcb0ad4/conditions/lang:SP/q/zmw:00000.1.85682.json", function(error, response, body) {
	  console.log(body);
	  res.render('index.ejs', {puntos: result, clima:body})
	});


    // renders index.ejs
    
  })
})

//Inicio el server si me logro conectar a la base
MongoClient.connect('mongodb://admin:abc123@ds035633.mlab.com:35633/fire', (err, database) => {
	if (err) return console.log(err);
	db = database;
	app.listen(3000, function() {
  		console.log('listening on 3000');
	});
 // ... start the server
})