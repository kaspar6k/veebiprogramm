const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

const {photoGallery, userPhotoGallery} = require('../controllers/galleryPhotoControllers');

router.route('/').get(photoGallery);
router.route('/user').get(userPhotoGallery);

module.exports = router;