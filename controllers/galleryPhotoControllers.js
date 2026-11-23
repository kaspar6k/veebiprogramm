const mysql = require('mysql2/promise');

const photoGalleryHome = (req, res) => {
	res.redirect('/galleryPhoto/1');
};

const photoGallery = async (req, res)=>{
	const privacyTexts = {1: 'Privaatne', 2: 'Kontoga isik', 3: 'Avalik'};	
	let page = parseInt(req.params.page);
	let conn;
	let skip = 0;
	const limit = 10;
	const privacy = 2;

	//konytollime et lk number poleks liiga vaike voi yldse on number
	if(page < 1 || isNaN(page)){
		page = 1;
	}
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		//palju on pilte mida galeriisse panna
		let sqlReq = 'SELECT count(id) AS photos FROM galleryphotos WHERE privacy >=? AND deleted IS NULL';
		const [countResult] = await conn.execute(sqlReq, [privacy]);
		const photoCount = countResult[0].photos;
		//kui lk number liiga suur
		if((page - 1) * limit >= photoCount){
			//valin viimase lk
			page = Math.max(1, Math.ceil(photoCount / limit));
		}
		skip = (page - 1) * limit;
		
		let galleryLinks
		//leht tagasi
		if(page === 1){
			galleryLinks = 'Eelmine leht &nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp;';
		} else {
			galleryLinks = `<a href="/galleryPhoto/${page - 1}">Eelmine leht</a> &nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp;`;
		}
		//edasi
		if(page * limit >= photoCount){
			galleryLinks += 'Järgmine leht'; 
		} else {
			galleryLinks += `<a href="/galleryPhoto/${page + 1}">Järgmine leht</a>`;
		}
		sqlReq = 'SELECT id, filename, alttext, privacy FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC LIMIT ?, ?';
		const [photos] = await conn.execute(sqlReq, [2, skip, limit]);
		let photoList = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = 'Galeriipilt';
			if(photos[i].alttext){
				altText = photos[i].alttext;
		}
		//see õpetaja asi!!!!!!!!
		photoList.push({src: photos[i].filename, alt: altText, id: photos[i].id, privacy: privacyTexts[photos[i].privacy]});
		}
		res.render('galleryPhoto', {photoList: photoList, links: galleryLinks});
		//see õpetaja asi!!!!!!!!
	}
	catch(err){
		console.log('viga galerii lugemisel: ' + err);
		galleryLinks = 'Eelmine leht &nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp; Järgmine leht';
		res.render('galleryPhoto', {photoList: [], links: galleryLinks});
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


const photoEdit = async (req, res)=>{
	const photoId = parseInt(req.params.id);
	if(isNaN(photoId)){
		return res.redirect('/galleryPhoto/user');
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT id, filename, alttext, privacy FROM galleryphotos WHERE id = ? AND userid = ? AND deleted IS NULL';
		const [rows] = await conn.execute(sqlReq, [photoId, req.session.userId]);
		if(rows.length === 0){
			//pilti pole või see pole sinu oma, võõrast ei näita
			return res.redirect('/galleryPhoto/user');
		}
		res.render('galleryPhotoEdit', {photo: rows[0]});
	}
	catch(err){
		console.log('viga foto lugemisel: ' + err);
		res.redirect('/galleryPhoto/user');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

const photoEditPost = async (req, res)=>{
	const photoId = parseInt(req.params.id);
	if(isNaN(photoId)){
		return res.redirect('/galleryPhoto/user');
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		if(req.body.photoDelete !== undefined){
			const sqlReq = 'UPDATE galleryphotos SET deleted = NOW() WHERE id = ? AND userid = ? AND deleted IS NULL';
			await conn.execute(sqlReq, [photoId, req.session.userId]);
		} else {
			let privacy = parseInt(req.body.privacyInput);
			if(![1, 2, 3].includes(privacy)){
				privacy = 1;
			}
			const altText = req.body.altInput.trim() || null;
			const sqlReq = 'UPDATE galleryphotos SET privacy = ?, alttext = ? WHERE id = ? AND userid = ? AND deleted IS NULL';
			await conn.execute(sqlReq, [privacy, altText, photoId, req.session.userId]);
		}
	}
	catch(err){
		console.log('viga foto muutmisel: ' + err);
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	res.redirect('/galleryPhoto/user');
};


module.exports = {
	photoGalleryHome,
	photoGallery,
	userPhotoGallery,
	photoEdit,
	photoEditPost,
};