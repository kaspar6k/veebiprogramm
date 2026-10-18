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


const seosed = async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT person.first_name, person.last_name, movie.title AS movie_title, movie.release_year, profession.title AS profession_title, person_in_movie.character_name FROM person_in_movie INNER JOIN person ON person_in_movie.person_id = person.id INNER JOIN movie ON person_in_movie.movie_id = movie.id INNER JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY movie.title, profession.title, person.last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmiseosed', {relationList: sqlRes});
	}
	catch(err){
		console.log('viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed', {relationList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};


const seosedValikud = async (conn)=>{
	const [personList] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name, first_name');
	const [movieList] = await conn.execute('SELECT id, title, release_year FROM movie ORDER BY title');
	const [positionList] = await conn.execute('SELECT id, title FROM profession ORDER BY title');
	return {personList: personList, movieList: movieList, positionList: positionList};
};

const seosedAdd = async (req, res)=>{
	let conn;
	let lists = {personList: [], movieList: [], positionList: []};
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		lists = await seosedValikud(conn);
		res.render('eestifilmiseosed_add', {...lists, notice: 'ootan sisestust', selPerson: null, selMovie: null, selPosition: null, role: null});
	}
	catch(err){
		console.log('viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed_add', {...lists, notice: 'andmebaasi suhtlus nurjus', selPerson: null, selMovie: null, selPosition: null, role: null});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

const seosedAddPost = async (req, res)=>{
	const personId = Number(req.body.personInput);
	const movieId = Number(req.body.movieInput);
	const positionId = Number(req.body.positionInput);
	const form = {selPerson: req.body.personInput, selMovie: req.body.movieInput, selPosition: req.body.positionInput, role: req.body.roleInput};
	let conn;
	let lists = {personList: [], movieList: [], positionList: []};
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		lists = await seosedValikud(conn);

		
		if(!Number.isInteger(personId) || personId <= 0 || !Number.isInteger(movieId) || movieId <= 0 || !Number.isInteger(positionId) || positionId <= 0){
			return res.render('eestifilmiseosed_add', {...lists, ...form, notice: 'vali isik, film ja amet'});
		}

		const [positionRes] = await conn.execute('SELECT title FROM profession WHERE id = ?', [positionId]);
		if(positionRes.length === 0){
			return res.render('eestifilmiseosed_add', {...lists, ...form, notice: 'ametit ei leitud'});
		}
		let role = null;
		if(positionRes[0].title.toLowerCase() === 'näitleja'){
			role = (req.body.roleInput || '').trim();
			if(role === ''){
				return res.render('eestifilmiseosed_add', {...lists, ...form, notice: 'tegelaskuju nimi puudub'});
			}
		}

		
		const [existing] = await conn.execute('SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?', [personId, movieId, positionId, role]);
		if(existing.length > 0){
			return res.render('eestifilmiseosed_add', {...lists, ...form, notice: 'selline seos on juba olemas'});
		}

		await conn.execute('INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?,?,?,?)', [personId, movieId, positionId, role]);
		res.render('eestifilmiseosed_add', {...lists, notice: 'andmed salvestati', selPerson: null, selMovie: null, selPosition: null, role: null});
	}
	catch (err){
		console.log('viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiseosed_add', {...lists, ...form, notice: 'andmebaasi suhtlus nurjus'});
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
	zanridAddPost,
	seosed,
	seosedAdd,
	seosedAddPost,
	
};
