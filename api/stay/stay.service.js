const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = { txt: '' }) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = collection.findOne({ _id: ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    try {
        const stayToSave = {
            vendor: stay.vendor,
            price: stay.price
        }
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stayId}`, err)
        throw err
    }
}

async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}
function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria['host._id'] = filterBy.byUserId 
    
    if (filterBy.price) criteria['price'] = { $gte: +filterBy.price[0], $lte: +filterBy.price[1] }

    if (filterBy.bedrooms) criteria['bedrooms'] = { $gte: +filterBy.bedrooms }

    if (filterBy.beds) criteria['beds'] = { $gte: +filterBy.beds }
    
    if (filterBy.type) criteria['type'] = { $in: filterBy.type }

    if (filterBy.amenities) criteria['amenities.amenitieType'] = { $in: filterBy.amenities }

    if (filterBy[0]) criteria['type'] = { $regex: filterBy[0], $options: 'i' }

    if (filterBy.where) {
        const regex = { $regex: filterBy.where, $options: 'i' }
        criteria.$or = [
            {
                'loc.city': regex
            },
            {
                'loc.country': regex
            },

        ]
    }
    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addStayMsg,
    removeStayMsg
}
