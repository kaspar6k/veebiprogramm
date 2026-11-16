//https://greeny.cs.tlu.ee/phpmyadmin

const express = require('express')
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks et saaks post osad ka katte
const bodyparser = require('body-parser');

//moodul andmebaasiga suhtlemiseks, promises osaga async
const mysql = require('mysql2/promise');

const session = require('express-session');
//moodul .env faili lugemiseks (parool), keskkonnamuutujate parsimiseks
const MySQLStore = require('express-mysql-session')(session);

require('dotenv').config();

const checkLogin = require('./src/checkLogin');
const dateET = require('./src/dateTimeET');
const textRef ='public/txt/vanasonad.txt';
const regTextRef ='public/txt/visits.txt';
//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();


//võtan kasutusele sessioni
/* app.use(session({
	secret: process.env.SES_SECRET,
	saveUninitialized: false,
	resave: false
})); */
const sessionStore = new MySQLStore ({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
});
app.use(session({
	secret: process.env.SES_SECRET,
	store: sessionStore,
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 4 //tunniga aeguvad sessioni küpsised
	}
}));

//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');

//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: true}));//kui vormised ainult tekst siis "false"

//marsruudid 
app.get('/', async (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	const dayNow = dateET.weekDay ();
	const dateNow = dateET.fullDate(0);
	const timeNow = dateET.fullTime();
	let photo = {filename: null, alttext: 'Uusim avalik foto'};
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
		const [rows] = await conn.execute(sqlReq, [3]);
		if(rows.length > 0){
			photo.filename = rows[0].filename;
			if(rows[0].alttext){
				photo.alttext = rows[0].alttext;
			}
		}
	}
	catch(err){
		console.log('viga uusima foto lugemisel: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow, photo: photo});
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

//sisseloginud kasutajate avaleht
app.get('/home', checkLogin.isLogin, (req, res)=>{
	res.render('home');
});

//väljalogimine
app.get('/logout', (req, res)=>{
	res.redirect('/');
});

const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

const kulastusRouter = require('./routes/kulastusRoutes');
app.use('/kulastus', kulastusRouter);

const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter );
 
const galleryPhotoRouter = require('./routes/galleryPhotoRoutes');
app.use('/galleryPhoto', galleryPhotoRouter);

//kasutajakonto loomise marsruut
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

//Sisselogimise marsruut
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

app.listen(5106);