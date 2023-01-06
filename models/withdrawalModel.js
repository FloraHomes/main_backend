import mongoose from "mongoose"

const withdrawalSchema = new mongoose.Schema(
    {
        amount: {type: Number, required: true},
        comment: {type: String, required: true},
        paymentDate: {type: Date, required: false},
        user: {type: String, required: false},
    },
    {
        timestamps: true
    }
)

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema)
export default Withdrawal