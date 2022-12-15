import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign(
      {
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user?.role,
        isComplete: user?.isComplete
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
  };
  
  export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decode;
          next();
        }
      });
    } else {
      res.status(401).send({status:false, message: 'No Token' });
    }
  };

  export const generateRefferalCode = () => {
    var text = "";
    
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 6; i++)
      text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
  }
  

  // export const isAdmin = (req, res, next) => {
  //   if (req.user && req.user.isAdmin) {
  //     next();
  //   } else {
  //     res.status(401).send({ message: 'Invalid Admin Token' });
  //   }
  // };