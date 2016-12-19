//Modulos requeridos en el server 
const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient
const csv = require('fast-csv');
const csv2 = require('fast-csv');
const validador = require("./ElectricArea_V2.0.js");
const detecIncendio = require("./fireCloseness.js");
const Estaciones = require("./Estaciones.js");
const request = require("request");
const stormpath = require('express-stormpath');
const engines = require('consolidate');
const async = require('async');
const plotly = require('plotly')("leorellanab", "s5I0DjS96UvYwuGjKd1c")
const fs = require('fs');




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
  },
  web: {
    me: {
      enabled: false
    },
    oauth2: {
      enabled: false
    },
    register: {
      enabled: false
    },
    forgotPassword:{
      enabled: false
    }
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
app.get('/lectura', stormpath.loginRequired, function(req, res) {

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
				console.log('Zona: ' + enZona);	
			 	if (enZona[0]){
			 		data.empresa = enZona[1];
			 		cerca = detecIncendio.IncendioCercano(puntos, lineasElectricas);
			 		if (cerca){
			 			console.log('Encontre 1 cerca');
			 			data.cercano = 1;
			 			//console.log(data);

			 			var estClimatologico = Estaciones.Estaciones(puntos);
				 		data.estacion = estClimatologico;


			 			/* CODIGO PARA ENVIO DE SMS
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
						 );*/



			 		}
			 		else{
			 			//console.log('no esta cerca');
			 			data.cercano = 0;

			 			var estClimatologico = Estaciones.Estaciones(puntos);
				 		data.estacion = estClimatologico;
				 		console.log('Estacion: ' + estClimatologico);
			 		}
			 		

			 		

				 	return true;


			 	}
			 	else {

				 	return false;
			 	}





			 	return enZona[0];
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

function httpGet(url, callback) {
  const options = {
    url :  url,
    json : true
  };
  request(options,
    function(err, res, body) {
      callback(err, body);
    }
  );
}


//para ver los puntos.
app.get('/mapa', stormpath.loginRequired, (req, res) => {
  db.collection('FirePoints').find().toArray((err, result) => {
    if (err) return console.log(err)

    
    	/*para sacar las fechas de ayer y anteayer*/
	var todayTimeStamp = +new Date; // Unix timestamp in milliseconds
	var oneDayTimeStamp = 1000 * 60 * 60 * 24; // Milliseconds in a day
	var diff = todayTimeStamp - oneDayTimeStamp;
	var diff2 = todayTimeStamp - oneDayTimeStamp - oneDayTimeStamp;
	var yesterdayDate = new Date(diff);
	var yesterdayDate2 = new Date(diff2);
	var todayDate = new Date(todayTimeStamp);
	var yesterdayString = yesterdayDate.getFullYear().toString() + (yesterdayDate.getMonth() + 1).toString() + yesterdayDate.getDate().toString();
	var anteayerString = yesterdayDate2.getFullYear().toString() + (yesterdayDate2.getMonth() + 1).toString() + yesterdayDate2.getDate().toString();
	var todayString = todayDate.getFullYear().toString() + (todayDate.getMonth() + 1).toString() + todayDate.getDate().toString();

	/*
	
		urls = [Concepcion Hoy,
				Concepcion Ayer,
				Concepcion Anteayer];

	*/
    var urls = ["http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.1.85682.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.1.85682.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.1.85682.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.248.85629.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.248.85629.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.248.85629.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.1.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.1.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.1.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.28.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.28.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.28.85672.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.79.85743.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.79.85743.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.79.85743.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+todayString+"/q/zmw:00000.1.85743.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+yesterdayString+"/q/zmw:00000.1.85743.json",
				  "http://api.wunderground.com/api/ac6084d23fcb0ad4/history_"+anteayerString+"/q/zmw:00000.1.85743.json"];

	console.log(urls);


	async.map(urls, httpGet, function(err, responses){
	  if (err){
	    console.log('error');
	  }
	  else {
	    //var auxResponse = responses[0].history.observations;
	    var auxResponse;
	    var textTemp = "Fecha,Temperatura C\\n";
	    var textHum = "Fecha,Humedad %\\n";
	    var textWind = "Fecha,Vel. Viento KpH\\n";
	    var textPrec = "Fecha,Precipitacion mm\\n";
	    var textTemp1 = "Fecha,Temperatura C\\n";
	    var textHum1 = "Fecha,Humedad %\\n";
	    var textWind1 = "Fecha,Vel. Viento KpH\\n";
	    var textPrec1 = "Fecha,Precipitacion mm\\n";
	    var textTemp2 = "Fecha,Temperatura C\\n";
	    var textHum2 = "Fecha,Humedad %\\n";
	    var textWind2 = "Fecha,Vel. Viento KpH\\n";
	    var textPrec2 = "Fecha,Precipitacion mm\\n";
	    var textTemp3 = "Fecha,Temperatura C\\n";
	    var textHum3 = "Fecha,Humedad %\\n";
	    var textWind3 = "Fecha,Vel. Viento KpH\\n";
	    var textPrec3 = "Fecha,Precipitacion mm\\n";
	    var textTemp4 = "Fecha,Temperatura C\\n";
	    var textHum4 = "Fecha,Humedad %\\n";
	    var textWind4 = "Fecha,Vel. Viento KpH\\n";
	    var textPrec4 = "Fecha,Precipitacion mm\\n";
	    var textTemp5 = "Fecha,Temperatura C\\n";
	    var textHum5 = "Fecha,Humedad %\\n";
	    var textWind5 = "Fecha,Vel. Viento KpH\\n";
	    var textPrec5 = "Fecha,Precipitacion mm\\n";
	    var auxPrec;

	    console.log("Respuesta con " + responses.length);
			    
		for (i = 0; i < 3; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}
			console.log("Termine Conce");
		}

		for (i = 3; i < 6; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp1 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum1 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind1 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec2 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}
			console.log("Termine Panguilemo");
		}

		for (i = 6; i < 9; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp2 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum2 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind2 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec2 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}
			console.log("Chillan Quinchamali");
		}

		for (i = 9; i < 12; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp3 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum3 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind3 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec3 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}
			console.log("Termas");
		}

		for (i = 12; i < 15; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp4 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum4 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind4 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec4 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}

			console.log("Lonquimay");
			console.log(auxResponse);
		}

		for (i = 15; i < 18; i++) { 
			auxResponse = responses[i].history.observations;
			for (j = 0; j < auxResponse.length; j++) { 

				textTemp5 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].tempm + "\\n";
				textHum5 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].hum + "\\n";
				textWind5 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxResponse[j].wspdm + "\\n";
				auxPrec = auxResponse[j].precipm;
				if (auxPrec == -9999)
				{
					auxPrec = 0;
				}
				textPrec5 += auxResponse[j].date.mon + "/" + auxResponse[j].date.mday + "/" + auxResponse[j].date.year + " " + auxResponse[j].date.hour + ":" + auxResponse[j].date.min  + "," + auxPrec + "\\n";
			}

			console.log("Araucania");
			console.log(auxResponse);

		}

		

	    res.render('index.ejs', {puntos: result, usuario:req.user, 
	    							dataTemp: textTemp, dataHum: textHum, dataWind: textWind, dataPrecip: textPrec, 
	    							dataTemp1: textTemp1, dataHum1: textHum1, dataWind1: textWind1, dataPrecip1: textPrec, 
	    							dataTemp2: textTemp2, dataHum2: textHum2, dataWind2: textWind2, dataPrecip2: textPrec2,
	    							dataTemp3: textTemp3, dataHum3: textHum3, dataWind3: textWind3, dataPrecip3: textPrec3,
	    							dataTemp4: textTemp4, dataHum4: textHum4, dataWind4: textWind4, dataPrecip4: textPrec4,
	    							dataTemp5: textTemp5, dataHum5: textHum5, dataWind5: textWind5, dataPrecip5: textPrec5})
	  }
	})

    /*request("http://api.wunderground.com/api/ac6084d23fcb0ad4/conditions/lang:SP/q/zmw:00000.1.85682.json", function(error, response, body) {
	  //console.log(body);
	  climaEstaciones = body;
	  res.render('index.ejs', {puntos: result, usuario:req.user})
	});*/


    // renders index.ejs
    
  })
})


//para ver los puntos.
app.get('/grafica', stormpath.loginRequired, (req, res) => {
	
	res.render('grafica.ejs', {imagen: '1.png'})

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