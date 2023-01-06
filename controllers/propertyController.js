import expressAsyncHandler from "express-async-handler";
import Property from "../models/propertyModel.js";

export const ownEarnerProperties = () => {
  expressAsyncHandler(async (req, res) => {
    const properties = await Property.find();
    res.send({
      status: true,
      message: "Properties fetch sucessfully",
      data: properties,
    });
  });
};

export const propertyById = () => {
  expressAsyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (property) {
      res.send(property);
    } else {
      res.status(404).send({ message: "property Not Found" });
    }
  });
};
