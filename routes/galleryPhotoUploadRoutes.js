const express = require('express');
const multer = require('multer');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

//seadistame multer vahevara failide üleslaadimiseks
const upload = multer({dest: process.env.UPLOAD_ORIGINAL_PATH});
//määrata saab veel naiteks lubatud failityype ja suurusi


const{
	galleryPhotoUpload,
	galleryPhotoUploadPost} = require(
	'../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);


//post osa suunatakse labi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

module.exports = router;


