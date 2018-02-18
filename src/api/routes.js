const router = module.exports = require('express').Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const auth = require('../controllers/authentication')
const user = require('../controllers/user')
const category = require('../controllers/category')
const post = require('../controllers/post')
const comment = require('../controllers/comment')
const relevance = require('../controllers/relevance')
const like = require('../controllers/like')

const isAuthenticated = require('../policies/is_authenticated')

router.post('/login', auth.login)
router.get('/logout', isAuthenticated, auth.logout)
router.get('/confirmation/:hash', auth.confirmation)
router.put('/forgot-password', auth.forgotPassword)

router.post('/user', upload.single('image'), user.post)
router.put('/user/:id', upload.single('image'), isAuthenticated, user.put)
router.get('/user/:id', isAuthenticated, user.get)

router.get('/category', isAuthenticated, category.getAll)
router.get('/category/:id', isAuthenticated, category.get)

router.post('/post', upload.single('image'), isAuthenticated, post.post)
router.put('/post/:id', upload.single('image'), isAuthenticated, post.put)
router.delete('/post/:id', isAuthenticated, post.destroy)
router.get('/post', isAuthenticated, post.getAll)
router.get('/post/:id', isAuthenticated, post.get)
router.get('/post/category/:categoryId', isAuthenticated, post.getByCategory)

router.post('/comment', upload.single('image'), isAuthenticated, comment.post)
router.put('/comment/:id', isAuthenticated, comment.put)
router.delete('/comment/:id', isAuthenticated, comment.destroy)
router.get('/comment/:id', isAuthenticated, comment.get)
router.get('/comment/post/:postId', isAuthenticated, comment.getByPost)

router.post('/relevance', isAuthenticated, relevance.post)
router.put('/relevance/:id', isAuthenticated, relevance.put)

router.post('/like', isAuthenticated, like.post)
router.put('/like/:id', isAuthenticated, like.put)
