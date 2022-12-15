import express from "express";
import expressAsyncHandler from "express-async-handler";
import Property from "../models/propertyModel.js";
import { isAuth } from "../utils.js";

const propertyRoutes = express.Router();

propertyRoutes.get(
  "/ownEarner",
  expressAsyncHandler(async (req, res) => {
    const properties = await Property.find();
    res.send({
      status: true,
      message: "Properties fetch sucessfully",
      data: properties,
    });
  })
);

propertyRoutes.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (property) {
      res.send(property);
    } else {
      res.status(404).send({ message: "property Not Found" });
    }
  })
);

export default propertyRoutes;
