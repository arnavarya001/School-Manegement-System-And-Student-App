const express = require('express');
const {
  getCategories,
  createCategory,
  getProducts,
  createProduct,
  deleteProduct,
  purchaseStock,
  issueItems,
  deleteIssuedItem,
  getStudentIssuedItems,
  getStockPurchases,
  getProductSales
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/categories')
  .get(getCategories)
  .post(authorize('super-admin', 'manager'), createCategory);

router
  .route('/products')
  .get(getProducts)
  .post(authorize('super-admin', 'manager', 'inventory-manager'), createProduct);

router
  .route('/products/:id')
  .delete(authorize('super-admin', 'manager', 'inventory-manager'), deleteProduct);

router.get('/purchases', authorize('super-admin', 'manager', 'inventory-manager', 'accountant'), getStockPurchases);
router.get('/sales', authorize('super-admin', 'manager', 'inventory-manager', 'accountant'), getProductSales);

router.post('/purchase', authorize('super-admin', 'manager', 'inventory-manager'), purchaseStock);
router.post('/issue', authorize('super-admin', 'manager', 'inventory-manager'), issueItems);
router.delete('/issued/:id', authorize('super-admin', 'manager', 'inventory-manager'), deleteIssuedItem);
router.get('/student/:studentId', getStudentIssuedItems);

module.exports = router;
