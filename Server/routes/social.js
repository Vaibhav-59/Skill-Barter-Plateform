const express = require('express');
const {
  getSocialData,
  connectSocial,
  removeSocial,
  fetchGithubData
} = require('../controllers/socialController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All social routes are protected

router.route('/')
  .get(getSocialData);

router.route('/connect')
  .post(connectSocial);

router.route('/remove/:platform')
  .delete(removeSocial);

router.route('/github')
  .get(fetchGithubData);

// Note: update is effectively synonymous with connect in the controller
router.route('/update')
  .put(connectSocial);

module.exports = router;
