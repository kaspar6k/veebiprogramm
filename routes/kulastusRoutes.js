const express = require('express');
const router = express.Router();

const{
	kulastus,
	regvisit,
	regvisitPost} = require('../controllers/kulastusControllers');

router.route('/').get(kulastus);
router.route('/reg').get(regvisit);
router.route('/reg').post(regvisitPost);

module.exports = router;