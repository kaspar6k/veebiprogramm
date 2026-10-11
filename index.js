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

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		await fs.appendFile(regTextRef, req.body.nameInput + ', ' + dateET.fullDate(0) + ', ' + dateET.fullTime() + ';');
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

app.get('/kulastus', async (req, res)=>{
	try {
		const data = await fs.readFile(regTextRef, 'utf8');
		let visits = data.split(';');
		let kulastus = visits[visits.length - 2];
		let parts = kulastus.split(',');
		res.render('kulastus', {name: parts[0].trim(), date: parts[1].trim(), time: parts[2].trim()});
	}
	catch (err){
		console.log(err);
		res.render('kulastus', {name: null, date: null, time: null});
	}
});

app.get('/eestifilmid', (req, res)=>{
	res.render('eestifilmid');
});

app.get('/eestifilm/inimesed', async (req, res)=>{
	console.log('Andmebaasi server on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaspar6k',
		});
		const sqlReq = 'SELECT * FROM person ORDER by last_name	';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch(err){
		console.log('viga andmaasist lugemisel: ' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
});

app.get('/eestifilm/inimesed_add', (req, res)=>{
	res.render('eestifilminimesed_add', {notice: 'ootan sisestust', firstName: null, lastName: null, born: null, deceased: null});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmete olemasolu
	const now = new Date();
	const bornDate = new Date(req.body.bornInput);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > now){
		console.log('Andmed pole korrektsed');	
		return res.render('eestifilminimesed_add', {notice: 'andmed on puudulikud', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});	
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaspar6k',
		});	
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		let deceasedDate = null;
		if(req.body.deceasedInput !=''){
			const deceasedObj = new Date(req.body.deceasedInput);
			if(isNaN(deceasedObj.getTime()) || deceasedObj > now || deceasedObj < bornDate){
				return res.render('eestifilminimesed_add', {notice: 'surmakuupäev on vigane', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});
			}
			deceasedDate = req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_add', {notice: 'andmed salvestati', firstName: null, lastName: null, born: null, deceased: null});
	}
	catch (err){
		console.log('viga andmebaasiga suhtlemisel' + err);
		res.render('eestifilminimesed_add', {notice: 'andmebaasi suhtlus nurjus', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/zanrid_add', (req, res)=>{
	res.render('eestifilmzanrid_add', {notice: 'ootan sisestust', genreName: null, description: null});
});

app.post('/eestifilm/zanrid_add', async (req, res)=>{
	if(!req.body.genreNameInput){
		return res.render('eestifilmzanrid_add', {notice: 'žanri nimi puudub', genreName: req.body.genreNameInput, description: req.body.descriptionInput});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaspar6k',
		});
		let sqlReq = 'INSERT INTO genre (name, description) VALUES (?,?)';
		await conn.execute(sqlReq, [req.body.genreNameInput, req.body.descriptionInput || null]);
		res.render('eestifilmzanrid_add', {notice: 'andmed salvestati', genreName: null, description: null});
	}
	catch (err){
		console.log('viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmzanrid_add', {notice: 'andmebaasi suhtlus nurjus', genreName: req.body.genreNameInput, description: req.body.descriptionInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/filmid', async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaspar6k',
		});
		const sqlReq = 'SELECT * FROM movie ORDER BY title';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmfilmid', {movieList: sqlRes});
	}
	catch(err){
		console.log('viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmfilmid', {movieList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/filmid_add', (req, res)=>{
	res.render('eestifilmfilmid_add', {notice: 'ootan sisestust', movieTitle: null, releaseYear: null, duration: null, description: null});
});

app.post('/eestifilm/filmid_add', async (req, res)=>{
	const now = new Date();
	const year = Number(req.body.yearInput);
	const duration = Number(req.body.durationInput);

	if(!req.body.titleInput){
		return res.render('eestifilmfilmid_add', {notice: 'filmi pealkiri puudub', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	if(!Number.isInteger(year) || year < 1880 || year > now.getFullYear()){
		return res.render('eestifilmfilmid_add', {notice: 'valmimisaasta on vigane', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	if(!Number.isInteger(duration) || duration <= 0){
		return res.render('eestifilmfilmid_add', {notice: 'kestus on vigane', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}

	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaspar6k',
		});
		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [req.body.titleInput, year, duration, req.body.descriptionInput || null]);
		res.render('eestifilmfilmid_add', {notice: 'andmed salvestati', movieTitle: null, releaseYear: null, duration: null, description: null});
	}
	catch (err){
		console.log('viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmfilmid_add', {notice: 'andmebaasi suhtlus nurjus', movieTitle: req.body.titleInput, releaseYear: req.body.yearInput, duration: req.body.durationInput, description: req.body.descriptionInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5106);