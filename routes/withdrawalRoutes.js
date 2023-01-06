import express from "express";
import expressAsyncHandler from "express-async-handler";
import { logWithdrawal, withdrawalByUserId } from "../controllers/withdrawalController.js";
import Goal from "../models/goalModel.js";
import Withdrawal from "../models/withdrawalModel.js";
import { goalByUserId } from "../controllers/goalController.js";
import { isAuth } from "../utils.js";
import { savePayment } from "../controllers/paymentController.js";

const withdrawalRoutes = express.Router();

withdrawalRoutes.get(
    '/mine',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const userId =  req.user._id
      const withdrawals = await withdrawalByUserId(userId) 
      const refferalFirstPaymentSum = await Goal.aggregate([
        {
          $match: {
            referralId: userId
          }
        },
        {
          $group: {
            _id: null,
            firstPaymentsSum: { $sum: '$firstPayment' },
    
          },
        },
        
      ]);
     
      const totalWithrawal = await Withdrawal.aggregate([
        {
          $match: {
            user: userId
          }
        },
        {
          $group: {
            _id: null,
            withrawalSum: { $sum: '$amount' },
          },
        },
        
      ]);
      res.status(200).send({status:true, message: "withdrawal fetched", data: {withdrawals, refferalFirstPaymentSum, totalWithrawal}});
    })
  );

withdrawalRoutes.post(
  '/save',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {amount, comment, paymentDate} = req.body
    const user =  req.user._id
    try{
      const result = await logWithdrawal(amount, comment, paymentDate, user)
    res.status(200).send({status:true, message: "withrawal logged", data: result});
    }catch(error) {
      res.status(301).send({status:true, message: "withrawal not logged", data: error});
    }
    
    
  })

)

withdrawalRoutes.post(
  '/propertyAccount',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {amount, comment, paymentDate} = req.body
    const user =  req.user._id
    const d = new Date();
    let time = d.getTime();
    const result = await goalByUserId(user)


    let amountPaid = amount
    let price = result[0]?.property?.currentPricePerUnit
    let purchasedUnit = (amountPaid/price).toFixed(2)
    let referenceId = `mtpa-${time}`
    let propertyId = result[0]?.property?._id
    let userId =  user
    let source = "Cash Wallet"


    try{
      const pay = await savePayment(amountPaid, purchasedUnit, price, referenceId, propertyId, userId, source) 
      const withdr = await logWithdrawal(amount, comment, paymentDate, user)
  
      
    res.status(200).send({status:true, message: "withrawal logged", data: withdr});
    }catch(error) {
      res.status(301).send({status:true, message: "withrawal not logged", data: error});
    }
    
    
  })

)


  export default withdrawalRoutes;