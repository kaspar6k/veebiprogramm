const mysql = require('mysql2/promise');
const fs = require('fs').promises
const sharp = require('sharp');
const galleryPhotoUpload = (req, res)=>{
	res.render('galleryPhotoUpload');
}; 

const galleryPhotoUploadPost = async (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	let conn;
	try{
		
		//genereerime oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		await fs.rename(req.file.path, req.file.destination + fileName);
		//vesimärk
		const vesimärk = await sharp('./public/pic/kuuskvesimärk.png').resize({width: 180}).toBuffer();
		//pildi suurus max 800x600
		await sharp(req.file.destination + fileName).resize(800, 600).composite([{input: vesimärk, gravity: 'southeast'}]).jpeg({quality: 90}).toFile(process.env.UPLOAD_RESIZED_PATH + fileName);
		//pisipilt
		await sharp(req.file.destination + fileName).resize(100, 100).jpeg({quality: 90}).toFile(process.env.UPLOAD_THUMBNAIL_PATH + fileName);
		let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
		const userId = 1; //see on ajutine kuniks paris kasutajakontod teeme
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const[result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyinput, userId]);
		console.log('Salvestati kirje id: ' + result.insertId); //teinekord kasulik
		
		res.render('galleryPhotoUpload');
	}
	catch (err){
		console.log('oih'+err)
		res.render('galleryPhotoUpload');
	}	
	finally {
		if(conn){
			await conn.end();
		}
	}
}; 

module.exports = {
	galleryPhotoUpload,
	galleryPhotoUploadPost,
	
}