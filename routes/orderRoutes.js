const express = require('express')
const { route } = require('express/lib/router')
const router = express.Router()

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrder,
  createOrder,
  updateOrder,
} = require('../controllers/orderController')
const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/authentication')

router
  .route('/')
  .get([authenticateUser, authorizePermissions('admin')], getAllOrders)
  .post(authenticateUser, createOrder)

router.route('/showAllMyOrders').get()

router.route('/:id').get(getSingleOrder).patch(updateOrder)

module.exports = router
