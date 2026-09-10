import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';
import * as admin from '../controllers/adminController.js';
import * as media from '../controllers/mediaController.js';
import { mediaUpload } from '../services/mediaService.js';

const router = Router();
const staff = ['editor', 'moderator', 'admin', 'superadmin'];
const managers = ['admin', 'superadmin'];

router.use(requireAuth);

router.get('/overview', requireRoles(...staff), admin.getOverview);
router.get('/analytics', requireRoles(...staff), admin.getAnalytics);

router.get('/media', requireRoles(...staff), media.listMedia);
router.post('/media/upload', requireRoles(...staff), mediaUpload.single('file'), media.uploadMedia);
router.post('/media/url', requireRoles(...staff), media.registerMediaUrl);
router.delete('/media/:id', requireRoles(...managers), media.deleteMedia);

router.get('/products', requireRoles(...staff), admin.listProducts);
router.get('/products/:id', requireRoles(...staff), admin.getProduct);
router.post('/products', requireRoles(...staff), admin.createProduct);
router.patch('/products/:id', requireRoles(...staff), admin.updateProduct);
router.patch('/products/:id/status', requireRoles('moderator', 'admin', 'superadmin'), admin.setProductStatus);
router.delete('/products/:id', requireRoles(...managers), admin.deleteProduct);

router.get('/brands', requireRoles(...staff), admin.listBrands);
router.post('/brands', requireRoles(...staff), admin.createBrand);
router.patch('/brands/:id', requireRoles(...staff), admin.updateBrand);
router.delete('/brands/:id', requireRoles(...managers), admin.deleteBrand);

router.get('/categories', requireRoles(...staff), admin.listCategories);
router.post('/categories', requireRoles(...staff), admin.createCategory);
router.patch('/categories/:id', requireRoles(...staff), admin.updateCategory);
router.delete('/categories/:id', requireRoles(...managers), admin.deleteCategory);

router.get('/articles', requireRoles(...staff), admin.listArticles);
router.get('/articles/:id', requireRoles(...staff), admin.getArticle);
router.post('/articles', requireRoles(...staff), admin.createArticle);
router.patch('/articles/:id', requireRoles(...staff), admin.updateArticle);
router.delete('/articles/:id', requireRoles(...managers), admin.deleteArticle);

router.get('/users', requireRoles(...managers), admin.listUsers);
router.post('/users', requireRoles(...managers), admin.createUser);
router.patch('/users/:id', requireRoles(...managers), admin.updateUser);

router.get('/audit', requireRoles(...staff), admin.listAudit);

export default router;
