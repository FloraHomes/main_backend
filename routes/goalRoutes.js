import express from "express";
import expressAsyncHandler from "express-async-handler";
import Goal from "../models/goalModel.js";
import { isAuth } from "../utils.js";


const goalRoutes = express.Router();

goalRoutes.post(
    "/save",
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const newGoal = new Goal({
        firstPayment: req.body.firstPayment,
        goalUnits: req.body.goalUnits,
        subsequentPurchase: req?.body?.subsequentPurchase,
        referralId: req?.body?.referralId,
        property: req?.body?.property,
        user: req.body.user,
        goalDuration: req.body?.goalDuration,
      });
  
   
      try {
        const goal = await newGoal.save();
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
     
      try{
        const goals = await Goal.find({ user: req.user._id }).populate('property');
        res.send({status: true, message:"goals fetch sucessfully", data: goals});
      }catch(error){
        res.send({status: false, message:"goals fetching failed", data: error});
      }
      
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

  

  export default goalRoutes;