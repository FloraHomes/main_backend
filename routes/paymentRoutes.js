import express from "express";
import expressAsyncHandler from "express-async-handler";
import Payment from "../models/paymentModel.js";
import { amountFormat, isAuth, mailgun, recieptEmailTemplate, simpleDateString } from "../utils.js";
import pdf from "pdf-creator-node"
import fs from "fs"
import { getBaseUrl } from "../server.js";
import User from "../models/userModel.js";



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

      const paySummary = await Payment.aggregate([
        {
          $match: {
            user: req.user._id 
          }
        },
        {
          $group: {
            _id: null,
            prevUnits: { $sum: '$purchasedUnit' },

          },
        },
        
      ]);


      const payment = await newPayment.save();
      await payment.populate('property', 'name')
      const user = await User.findOne({_id: req.body.userId})

      console.log('email', user.email);

   
      const recieptTemplate = getBaseUrl("template/reciept.html");
      let html = fs.readFileSync(recieptTemplate, "utf8");
      let tot = Number(req.body.purchasedUnit) + Number(paySummary[0]?.prevUnits)

      var recieptData = {
        recieptId: `FHGC-${payment?._id}`,
        amount: amountFormat(payment?.amountPaid),
        price: amountFormat(payment?.price),
        date: simpleDateString(payment?.createdAt),
        customerName: `${user?.firstName} ${user?.lastName}`,
        qty: amountFormat(req.body.purchasedUnit),
        price: amountFormat(req?.body?.price),
        prevPurchase: amountFormat(paySummary[0]?.prevUnits),
        totalPurchase: amountFormat(tot),
        property: payment?.property?.name

      }

      console.log(recieptData);

      var options = {
        format: "A4",   
        orientation: "portrait",
        border: "10mm",
      };
      
   

      var document = {
        html: html,
        data: {
          recieptData,
        },
        path: `./attachment/${payment?._id}.pdf`,
        type: "",
      };

      pdf
      .create(document, options)
      .then((res) => {
        // console.log(res);
        const filePath = getBaseUrl(`attachment/${payment?._id}.pdf`)

        mailgun()
        .messages()
        .send(
          {
            from: 'Florahomes <admin@florahomes99.com>',
            to: `Ibrahim Olayioye <ibraphem@gmail.com>`,
            subject: `Successful Payment`,
            html: recieptEmailTemplate(recieptData?.customerName),
            attachment: filePath?.pathname.substring(1)
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
              fs.unlink(`./attachment/${payment?._id}.pdf`, (err) => {
                if (err) {
                  console.log(err);
                    // throw err;
                }
            
                console.log("Delete File successfully.");
            });
            }
          }
        );
     
      })
      .catch((error) => {
        console.error(error);
      });

     
      res.status(200).send({status:true, message: "Payment was made and logged successfully", data: payment});
      
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