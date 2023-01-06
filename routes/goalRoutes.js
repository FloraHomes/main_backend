import express from "express";
import expressAsyncHandler from "express-async-handler";
import { goalByUserId } from "../controllers/goalController.js";
import { savePayment } from "../controllers/paymentController.js";
import Goal from "../models/goalModel.js";
import { isAuth } from "../utils.js";


const goalRoutes = express.Router();

goalRoutes.post(
    "/save",
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const {firstPayment, goalUnits, subsequentPurchase, referralId, property, user, goalDuration} = req.body
      const newGoal = new Goal({
        firstPayment,
        goalUnits,
        subsequentPurchase,
        referralId,
        property,
        user,
        goalDuration,
      });

   


      try {
        const goal = await newGoal.save();
        if(referralId) {

          const d = new Date();
          let time = d.getTime();
    
          const result = await goalByUserId(referralId)



          let amountPaid = 0.8 * (firstPayment * 0.1)
          let price = result[0]?.property?.currentPricePerUnit
          let purchasedUnit = (amountPaid/price).toFixed(2)
          let referenceId = `rfb-${time}`
          let propertyId = result[0]?.property?._id
          let userId =  referralId
          let source = "Referral Bonus"

      

        const pay = await savePayment(amountPaid, purchasedUnit, price, referenceId, propertyId, userId, source) 
   
         
        }
        res.status(200).send({status:true, message: "goal recorded", data: goal});
      }catch(error){
        res.status(301).send({status:false, message: "goal not recorded", data: error});

      }    
    })
  );

  goalRoutes.get(
    '/mine',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const userId =  req.user._id
      const result = await goalByUserId(userId) 
      res.status(200).send({status:true, message: "goal fetched", data: result});
    })
  );

  goalRoutes.get(
    '/referrals',
    isAuth,
    expressAsyncHandler(async (req, res) => {
    try{
        const goals = await Goal.find({ referralId: req.user._id }).sort({createdAt:-1}).populate('user', 'firstName lastName photoUrl createdAt');
        res.send({status: true, message:"referrals fetched sucessfully", data: goals});
    }catch(error){
        res.send({status: false, message:"Unable to fetch refferals", data: error});
    }
    
    })
  );

  goalRoutes.get(
    '/summary',
    isAuth,
    expressAsyncHandler(async (req, res) => {
  
        const referrals = await Goal.find({ referralId: req.user._id }).sort({createdAt:-1}).limit(3).populate('user', 'firstName lastName photoUrl createdAt');
        const referralCount = await Goal.aggregate([
            {
              $match: {
                referralId: req.user._id 
              }
            },
            {
              $group: {
                _id: null,
                noOfReferrals: { $count: {} },
              },
            },
            
          ]);
        
          res.send({referrals,referralCount });

    
    })
  );

  goalRoutes.get(
    '/test/:id',
    expressAsyncHandler(async (req, res) => {
    
      const result = await goalByUserId(req.params?.id)
      console.log(result);
      res.send({ status: true, message: "goals fetch sucessfully", data: result });
    })
  );

  

  export default goalRoutes;