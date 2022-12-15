import express from "express"
import { properties, users } from "../mock/data.js";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";

const seedRoutes = express.Router();

seedRoutes.get('/users', async(req, res) => {

    await User.remove({})
    const createdUsers = await User.insertMany(users)

    res.send({createdUsers})
})

seedRoutes.get('/properties', async(req, res) => {

    await Property.remove({})
    const createdProperties = await Property.insertMany(properties)

    res.send({createdProperties})
})

export default seedRoutes