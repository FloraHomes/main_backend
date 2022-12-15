import mongoose from "mongoose"

const goalSchema = new mongoose.Schema(
    {
        firstPayment: {type: Number, required: true},
        goalUnits: {type: Number, required: true},
        goalDuration: {type: Number, required: true},
        subsequentPurchase: {type: Number, required: true},
        referralId: {type: String, required: false},
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true
    }
)

const Goal = mongoose.model('Goal', goalSchema)
export default Goal