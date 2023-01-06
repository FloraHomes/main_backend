import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils.js";

export const signIn = async(req, res) => {

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          status: true,
          data: {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user?.phone,
            role: user.role,
            address: user.address,
            isComplete: user?.isComplete,
            photoUrl: user?.photoUrl,
            signatureUrl: user?.signatureUrl,
            property: user?.property,
            token: generateToken(user),
          },
          message: "Authentication Successful",
        });
        return;
      }
    }

    res
      .status(401)
      .send({ status: false, message: "Invalid email or password" });

};

export const signup = () => {
  expressAsyncHandler(async (req, res) => {
    return req
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req?.body?.phone,
      role: req?.body?.role,
      isComplete: req?.body?.isComplete,
      password: bcrypt.hashSync(req.body.password),
    });

    const user = await newUser.save();

    res.send({
      status: true,
      data: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user?.phone,
        role: user.role,
        address: user.address,
        isComplete: user?.isComplete,
        photoUrl: user?.photoUrl,
        signatureUrl: user?.signatureUrl,
        property: user?.property,
        token: generateToken(user),
      },
      message: "Authentication Successful",
    });
  });
};

export const updateUser = () => {
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body._id);
    if (user) {
      user.firstName = req.body?.firstName || user.firstName;
      user.lastName = req.body?.lastName || user.lastName;
      user.email = req.body?.email || user.email;
      user.role = req.body?.role || user.body.role;
      user.phone = req.body?.phone || user.phone;
      user.address = req.body?.address || user.address;
      user.property = req?.body?.propertyId || user.body.propertyId;
      user.isComplete = true;
      user.idUploadUrl = req.body?.idUploadUrl || user.body.idUploadUrl;
      user.photoUrl = req.body?.photoUrl || user.body.photoUrl;
      user.signatureUrl = req.body?.signatureUrl || user.body.signatureUrl;
      const updatedUser = await user.save();
      res.send({
        status: true,
        data: {
          _id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser?.phone,
          role: updatedUser.role,
          address: updatedUser.address,
          isComplete: updatedUser?.isComplete,
          photoUrl: updatedUser?.photoUrl,
          signatureUrl: updatedUser?.signatureUrl,
          property: updatedUser?.property,
          token: generateToken(updatedUser),
        },
        message: "Update Successful",
      });
    } else {
      res.status(404).send({ status: false, message: "User Not Found" });
    }
  });
};
