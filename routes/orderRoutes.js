const express = require('express')
const { createOrder,
    getAllOrder,
    getSingleOrder,
    updateOrder,
    getCurrentUserOrders } = require('../controllers/orderController')
const router = express.Router()
const {
    authenticateUser,authorizePermissions
} = require('../middleware/authentication')


router.route('/').get(authenticateUser,authorizePermissions('admin'), getAllOrder).post(authenticateUser, createOrder)
router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders)
router.route('/:id').get(authenticateUser, getSingleOrder).patch(authenticateUser, updateOrder)

module.exports = router