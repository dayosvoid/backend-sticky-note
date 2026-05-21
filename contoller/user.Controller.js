const USER = require("../model/user.Schema");
const customError = require("../utils/customError");

const handleRegister = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    return next(new customError("Input required credentials", 400));
  }
  try {
    const emailExist = await USER.findOne({ email: email });
    if (emailExist) {
      return next(new customError("user already exist", 400));
    }
    // const hashedpassword = await USER.hashPassword(password);
    const NewUser = await USER.create({
      fullname: fullname,
      email: email,
      password:password,
    });

    // Strip password from response object for clean security practice
    NewUser.password = undefined

    return res.status(201).json({
      success: true,
      message: "New user created successfully",
      data: NewUser,
    });
  } catch (error) {
    return next(error);
  }
};

const handleLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new customError("Input required credentials", 400));
  }
  try {
    const userExist = await USER.findOne({email:email})
    if(!userExist){
        return next(new customError("User not found", 404))
    }

    const validPassword = await userExist.comparedPassword(password)
    if(!validPassword){
        return next(new customError("Invaid email or password", 401))
    }

    const token = await userExist.generateJwtToken()

    return res.status(200).json({
        success:true,
        message:`welcome ${userExist.fullname.split(" "),[0]}`,
        token
       })
    
  } catch (error) {
    return next(error)
  }
};

module.exports = { handleRegister, handleLogin };
