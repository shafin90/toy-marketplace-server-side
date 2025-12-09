const express = require('express');
const router = express.Router();
const CollectionController = require('../controllers/CollectionController');

// Collection routes
router.post('/collections', CollectionController.createCollection);
router.get('/collections/:collectionId', CollectionController.getCollection);
router.get('/collections/shop/:shopOwnerEmail', CollectionController.getShopCollections);
router.put('/collections/:collectionId/toy', CollectionController.addToyToCollection);
router.delete('/collections/:collectionId/toy/:toyId', CollectionController.removeToyFromCollection);
router.put('/collections/:collectionId', CollectionController.updateCollection);
router.delete('/collections/:collectionId', CollectionController.deleteCollection);

module.exports = router;

