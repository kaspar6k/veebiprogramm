const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

const {photoGalleryHome, userPhotoGallery, photoGallery, photoEdit, photoEditPost} = require('../controllers/galleryPhotoControllers');

router.route('/').get(photoGalleryHome);
router.route('/user').get(userPhotoGallery);
router.route('/edit/:id').get(photoEdit).post(photoEditPost);
//jätan viimaseks
router.route('/:page').get(photoGallery);


module.exports = router;