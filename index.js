const express = require('express')
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks et saaks post osad ka katte
const bodyparser = require('body-parser');

const dateET = require('./src/dateTimeET');
const textRef ='public/txt/vanasonad.txt';
const regTextRef ='public/txt/visits.txt';
//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();

//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');

//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'))

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
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.lenght - 1))]});
	}
	catch (err){
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});

app.post('/regvisit', async (req, res)=>{
	try {
		await fs.open('a');
		await fs.appedFile(regTextRef, req.body.nameInput + ';');
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

app.listen(5106);