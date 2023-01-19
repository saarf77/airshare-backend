const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    console.log("🚀 ~ file: order.service.js:7 ~ query ~ filterBy", filterBy)
    try {
        let userId
    // if(filterBy.hostId){
    //     userId = filterBy.hostId
    // }
    // if(filterBy.buyerId){
    //     userId = filterBy.buyerId
    // }
        const criteria = {
            byUserId : userId,
        }
        console.log("🚀 ~ file: order.service.js:19 ~ query ~ userId", userId)
            console.log("🚀 ~ file: order.service.js:19 ~ query ~ criteria", criteria)
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()
        // console.log("🚀 ~ file: order.service.js:21 ~ query ~ orders", orders)
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ _id: ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ _id: ObjectId(orderId) })
        return orderId
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function update(order) {
    try {
        const orderToSave = JSON.parse(JSON.stringify(order))
           delete orderToSave._id
        
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(order._id) }, { $set: orderToSave })
        return order
    } catch (err) {
        logger.error(`cannot update order ${orderId}`, err)
        throw err
    }
}

async function addOrderMsg(orderId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(orderId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add order msg ${orderId}`, err)
        throw err
    }
}

async function removeOrderMsg(orderId, msgId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: ObjectId(orderId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add order msg ${orderId}`, err)
        throw err
    }
}
function _buildCriteria(filterBy) {

    const criteria = {}
    if(filterBy.hostId){
        criteria['host.id'] = filterBy.hostId
    }
    if(filterBy.buyerId){
        criteria['buyer._id'] = filterBy.buyerId
    }
    
    return criteria
}


module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addOrderMsg,
    removeOrderMsg
}
