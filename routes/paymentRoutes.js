import express from "express";
import expressAsyncHandler from "express-async-handler";
import Payment from "../models/paymentModel.js";
import { isAuth } from "../utils.js";
import { paymentById, savePayment } from "../controllers/paymentController.js";



const paymentRoutes = express.Router();

paymentRoutes.post(
    "/save",
    isAuth,
    expressAsyncHandler(async (req, res) => {

      const {amountPaid, purchasedUnit, price, referenceId, propertyId, userId, source} = req.body
      const result = await savePayment(amountPaid, purchasedUnit, price, referenceId, propertyId, userId, source) 

      res.send({status:true, message: "Payment was made and logged successfully", data: result});
      
    } )
  );

  paymentRoutes.get(
    '/mine',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const userId =  req.user._id
     const result = await paymentById(userId)
     res.send({status: true, message:"payments fetch sucessfully", data: result});

    })
  );

  paymentRoutes.get(
    '/summary',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const payments = await Payment.find({ user: req.user._id }).sort({createdAt:-1}).limit(4).populate('property', 'name'); 
      const paySummary = await Payment.aggregate([
        {
          $match: {
            user: req.user._id 
          }
        },
        {
          $group: {
            _id: null,
            purchasedUnits: { $sum: '$purchasedUnit' },
            amount: { $sum: '$amountPaid' },
          },
        },
        
      ]);
      res.send({paySummary, payments});
    })
  );

  export default paymentRoutes;