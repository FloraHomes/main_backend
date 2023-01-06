import Goal from "../models/goalModel.js";

export const goalByUserId = async (userId) => {
    const goals = await Goal.find({ user: userId }).populate("property");
   return goals
};
