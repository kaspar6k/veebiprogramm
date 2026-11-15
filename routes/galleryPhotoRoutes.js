const express = require('express');
const router = express.Router();

const {photoGallery} = require('../controllers/galleryPhotoControllers');

router.route('/').get(photoGallery);

module.exports = router;