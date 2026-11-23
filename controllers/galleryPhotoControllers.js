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
		const sqlReq = 'SELECT id, filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
		const [photos] = await conn.execute(sqlReq, [2]);
		let photoList = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = 'Galeriipilt';
			if(photos[i].alttext){
				altText = photos[i].alttext;
		}
		//see õpetaja asi!!!!!!!!
		photoList.push({src: photos[i].filename, alt: altText, id: photos[i].id});
		}
		res.render('galleryPhoto', {photoList: photoList});
		//see õpetaja asi!!!!!!!!
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



const userPhotoGallery = async (req, res)=>{
	const privacyTexts = {1: 'Privaatne', 2: 'Kontoga isik', 3: 'Avalik'};
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT id, filename, alttext, privacy FROM galleryphotos WHERE userid = ? AND deleted IS NULL ORDER BY id DESC';
		const [photos] = await conn.execute(sqlReq, [req.session.userId]);
		let photoList = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = 'Galeriipilt';
			if(photos[i].alttext){
				altText = photos[i].alttext;
		}
		//see õpetaja asi!!!!!!!!
		photoList.push({src: photos[i].filename, alt: altText, id: photos[i].id, privacy:privacyTexts[photos[i].privacy]});
		}
		res.render('userGalleryPhoto', {photoList: photoList});
		//see õpetaja asi!!!!!!!!
	}
	catch(err){
		console.log('viga galerii lugemisel: ' + err);
		res.render('userGalleryPhoto', {photoList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	photoGallery,
	userPhotoGallery
};