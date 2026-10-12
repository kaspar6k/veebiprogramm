const fs = require('fs').promises;
const dateET = require('../src/dateTimeET');
const regTextRef = 'public/txt/visits.txt';


//app.get('/kulastus', async (req, res)=>{
const kulastus = async (req, res) =>{
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
};

//app.get('/regvisit', (req, res)=>{
const regvisit = (req, res) =>{
	res.render('regvisit');
};

//app.post('/regvisit', async (req, res)=>{
const regvisitPost = async (req, res)=>{
	try {
		await fs.appendFile(regTextRef, req.body.nameInput + ', ' + dateET.fullDate(0) + ', ' + dateET.fullTime() + ';');
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
};



module.exports = {
	kulastus,
	regvisit,
	regvisitPost
};