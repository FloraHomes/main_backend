import Payment from "../models/paymentModel.js";
import { amountFormat, mailgun, recieptEmailTemplate, simpleDateString } from "../utils.js";
import pdf from "pdf-creator-node"
import fs from "fs"
import { getBaseUrl } from "../server.js";
import User from "../models/userModel.js";

export const savePayment = async(amountPaid, purchasedUnit, price, referenceId, propertyId, userId, source) => {
  const newPayment = new Payment({
    amountPaid,
    purchasedUnit,
    price,
    referenceId,
    property: propertyId,
    user: userId,
    source
  });

  const paySummary = await Payment.aggregate([
    {
      $match: {
        user: userId
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
  const user = await User.findOne({_id: userId})

  const recieptTemplate = getBaseUrl("template/reciept.html");
  let html = fs.readFileSync(recieptTemplate, "utf8");
  let previousPurchase = paySummary[0]?.prevUnits ? paySummary[0]?.prevUnits : 0
  let tot = Number(purchasedUnit) + Number(previousPurchase)

  var recieptData = {
    recieptId: `FHGC-${payment?._id}`,
    amount: amountFormat(payment?.amountPaid),
    price: amountFormat(payment?.price),
    date: simpleDateString(payment?.createdAt),
    customerName: `${user?.firstName} ${user?.lastName}`,
    qty: amountFormat(purchasedUnit),
    price: amountFormat(price),
    prevPurchase: amountFormat(previousPurchase),
    totalPurchase: amountFormat(tot),
    property: payment?.property?.name,
    source: source

  }


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
    const filePath = getBaseUrl(`attachment/${payment?._id}.pdf`)

    mailgun()
    .messages()
    .send(
      {
        from: 'Florahomes <admin@florahomes.com>',
        to: `Ibrahim Olayioye <${user.email}>`,
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

 
  return payment
}

export const paymentById = async(userId) => {
  const payments = await Payment.find({ user: userId }).sort({createdAt:-1}).populate('property', 'name');
  return payments
}


