import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
    {
        amountPaid: {type: Number, required: true},
        purchasedUnit: {type: Number, required: true},
        price: {type: String, required: true},
        source: {type: String, required: true},
        referenceId: {type: String, required: true, unique: true},
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
        user: {type: String, required: true},
    },
    {
        timestamps: true
    }
)

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment