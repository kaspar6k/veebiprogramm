const mysql = require('mysql2/promise');

const eestifilm = (req, res)=>{
	res.render('eestifilm');
}; 

//('/eestifilm/inimesed', async (req, res)=>{
const inimesed = async (req, res)=>{
	console.log('Andmebaasi server on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
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
};	
	
//app.get('/eestifilm/inimesed_add', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilminimesed_add', {notice: 'ootan sisestust', firstName: null, lastName: null, born: null, deceased: null});
};

//app.post('/eestifilm/inimesed_add', async (req, res)=>{
const inimesedAddPost = async (req, res) => {
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
			database: process.env.DB_NAME,
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
};


//app.get('/eestifilm/filmid', async (req, res)=>{
const filmid = async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
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
};

//app.get('/eestifilm/filmid_add', (req, res)=>{
const filmidAdd = (req, res)=>{
	res.render('eestifilmfilmid_add', {notice: 'ootan sisestust', movieTitle: null, releaseYear: null, duration: null, description: null});
};

//app.post('/eestifilm/filmid_add', async (req, res)=>{
const filmidAddPost = async (req, res)=>{
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
			database: process.env.DB_NAME,
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
};

//app.get('/eestifilm/zanrid', async (req, res)=>{
const zanrid = async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT * FROM genre ORDER BY name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmzanrid', {genreList: sqlRes});
	}
	catch(err){
		console.log('viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmzanrid', {genreList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//app.get('/eestifilm/zanrid_add', (req, res)=>{
const zanridAdd = (req, res)=>{
	res.render('eestifilmzanrid_add', {notice: 'ootan sisestust', genreName: null, description: null});
};

//app.post('/eestifilm/zanrid_add', async (req, res)=>{
const zanridAddPost = async (req, res)=>{
	if(!req.body.genreNameInput){
		return res.render('eestifilmzanrid_add', {notice: 'žanri nimi puudub', genreName: req.body.genreNameInput, description: req.body.descriptionInput});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
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
};





module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	filmid,
	filmidAdd,
	filmidAddPost,
	zanrid,
	zanridAdd,
	zanridAddPost
};
