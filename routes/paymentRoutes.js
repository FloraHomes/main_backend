import express from "express";
import expressAsyncHandler from "express-async-handler";
import Payment from "../models/paymentModel.js";
import { isAuth } from "../utils.js";


const paymentRoutes = express.Router();

paymentRoutes.post(
    "/save",
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const newPayment = new Payment({
        amountPaid: req.body.amountPaid,
        purchasedUnit: req.body.purchasedUnit,
        price: req?.body?.price,
        referenceId: req?.body?.referenceId,
        property: req?.body?.propertyId,
        user: req.body.userId,
      });
  
   
      try {
        const payment = await newPayment.save();
        res.status(200).send({status:true, message: "Payment was made and logged successfully", data: payment});
      }catch(error){
        res.status(301).send({status:false, message: "Logging payment failed", data: error});

      }
  
      
    })
  );

  paymentRoutes.get(
    '/mine',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const payments = await Payment.find({ user: req.user._id }).sort({createdAt:-1}).populate('property', 'name');
      res.send({status: true, message:"payments fetch sucessfully", data: payments});
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