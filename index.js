//https://greeny.cs.tlu.ee/phpmyadmin

const express = require('express')
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks et saaks post osad ka katte
const bodyparser = require('body-parser');

//moodul andmebaasiga suhtlemiseks, promises osaga async
const mysql = require('mysql2/promise');

//moodul .env faili lugemiseks (parool), keskkonnamuutujate parsimiseks
require('dotenv').config();

const dateET = require('./src/dateTimeET');
const textRef ='public/txt/vanasonad.txt';
const regTextRef ='public/txt/visits.txt';
//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();

//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');

//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	const dayNow = dateET.weekDay ();
	const dateNow = dateET.fullDate(0);
const timeNow = dateET.fullTime();
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err){
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});

app.get('/oppimine', (req, res)=>{
	res.render('oppimine');
});


app.get('/eestifilmid', (req, res)=>{
	res.render('eestifilmid');
});

const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

const kulastusRouter = require('./routes/kulastusRoutes');
app.use('/kulastus', kulastusRouter);

app.listen(5106);