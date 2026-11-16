const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

const {photoGallery} = require('../controllers/galleryPhotoControllers');

router.route('/').get(photoGallery);

module.exports = router;