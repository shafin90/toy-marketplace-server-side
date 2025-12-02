const express = require('express');
const ToyController = require('../controllers/ToyController');
const upload = require('../utils/upload');

const router = express.Router();

router.get('/toys', ToyController.getAllToys);
router.get('/toys/:id', ToyController.getToyById);
router.post('/toys', upload.single('picture'), ToyController.addToy);
router.post('/toys/shop-toy', upload.single('picture'), ToyController.addShopToy);
router.post('/toys/old-toy', upload.single('picture'), ToyController.addOldToy);
router.put('/toys/:id', upload.single('picture'), ToyController.updateToy);
router.delete('/toys/:id', ToyController.deleteToy);
router.get('/mytoys', ToyController.getMyToys);
router.get('/toys/pending', ToyController.getPendingOldToys);
router.put('/toys/:toyId/approve/:shopOwnerEmail', ToyController.approveOldToy);
router.put('/toys/:toyId/reject/:shopOwnerEmail', ToyController.rejectOldToy);

module.exports = router;
