const mysql = require('mysql2/promise');

const photoGallery = async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
		const [sqlRes] = await conn.execute(sqlReq, [2]);
		res.render('galleryPhoto', {photoList: sqlRes});
	}
	catch(err){
		console.log('viga galerii lugemisel: ' + err);
		res.render('galleryPhoto', {photoList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	photoGallery
};