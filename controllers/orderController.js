const Orders = require('../models/order')

const Product = require('../models/Product')

const { StatusCodes } = require('http-status-codes')

const CustomError = require('../errors')

const { checkPermission } = require('../utils')


const fakeStripeAPI = async(amount,currency)=>{
    const client_secret = 'someRandomValue'
    return{client_secret,amount}
}

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body
    if (!cartItems || cartItems.length < 1) {
        throw new CustomError.BadRequestError('No cart items provided')
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('Please  provide tax and shipping fee')
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product })
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No item with id:${item.product}`)
        }
        const { name, price,image, _id } = dbProduct
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        }
        // add item to order
        orderItems = [...orderItems, singleOrderItem]
        // calculate subtotal
        subtotal += item.amount * price
        // console.log(name,price,image);
    }
    // calculate total
    const total = tax + shippingFee + subtotal
    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount : total,
        currency:'usd'
    })
    const order = await Orders.create({
        orderItems,total,subtotal,tax,shippingFee,clientSecret:paymentIntent.client_secret,user:req.user.userId
    })
    res.status(StatusCodes.CREATED).json({order,clientSecret:order.clientSecret})
}
const getAllOrder = async (req, res) => {
   const order = await Orders.find({})
   res.status(StatusCodes.OK).json({order,count:order.length})
}
const getSingleOrder = async (req, res) => {
    const{id:orderId}=req.params
    const order = await Orders.findOne({_id:req.params.id})
    if (!order) {
        throw new CustomError.NotFoundError(`No order with id:${orderId}`)
    }
    checkPermission(req.user,order.user)
    res.status(StatusCodes.OK).json({order})
}
const getCurrentUserOrders = async (req, res) => {
    const orders = await Orders.findOne({user:req.user.userId})
    res.status(StatusCodes.OK).json({orders,count:orders.length})
}
const updateOrder = async (req, res) => {
 const{id:orderId}=req.params
 const {paymentIntentId}=req.body
    const order = await Orders.findOne({_id:orderId})
    if (!order) {
        throw new CustomError.NotFoundError(`No order with id:${orderId}`)
    }
    checkPermission(req.user,order.user)
    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()


    res.status(StatusCodes.OK).json({order})
}


module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    updateOrder,
    getCurrentUserOrders
}