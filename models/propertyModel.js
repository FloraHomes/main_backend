import mongoose from "mongoose"

const propertySchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        photo: {type: String, required: true},
        currentPricePerUnit: {type: String, required: true},
        title: {type: String, required: true},
        area: {type: String, required: true},
        unitsPerPlot: {type: String, required: true},
    },
    {
        timestamps: true
    }
)

const Property = mongoose.model('Property', propertySchema)
export default Property