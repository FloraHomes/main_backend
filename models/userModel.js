import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        phone: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, default: "ownEarner", required: false},
        isComplete: {type: Boolean, default: false, required: false},
        address: {type: String, required: false},
        photoUrl: {type: String, required: false},
        idUploadUrl: {type: String, required: false},
        signatureUrl: {type: String, required: false},
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: false,
        },
        // propertyId: {type: String, required: false}, 
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)
export default User