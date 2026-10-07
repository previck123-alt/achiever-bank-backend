const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const { generateAcessToken, OneTimePasswordTemplate, WelcomeTemplate, NotifyAdmin, LoanRequestTemplate, CardRequestTemplate, SenderRequestTemplate, RecieverRequestTemplate, AdminCardRequestTemplate, AdminDepositRequestTemplate, AdminDebitRequestTemplate, AdminTransferRequestTemplate, AdminLoanRequestTemplate, contactEmail } = require('../utils/utils')
const { User, Token, History, Beneficiaries, Account, Admin, AppSettings } = require("../database/databaseConfig");
const random_number = require("random-number")
const NanoId = require('nano-id');
const moment = require('moment')
let request = require('request');
const { Resend } = require('resend');
const { verifyPin } = require('../utils/pin');
const resend = new Resend(process.env.RESEND);

const { verifyTransactionToken, verifyEmailTemplate, passwordResetTemplate, TransferRequestTemplate, DebitRequestTemplate, DepositRequestTemplate } = require('../utils/utils')



module.exports.getUserFromJwt = async (req, res, next) => {
   try {
      let token = req.headers["header"]

      if (!token) {
         throw new Error("a token is needed ")
      }
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
      const user = await User.findOne({ email: decodedToken.email })

      if (!user) {
         //if user does not exist return 404 response
         return res.status(404).json({
            response: "user has been deleted"
         })
      }

      return res.status(200).json({
         response: {
            user: user,
         }
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }

}




// Fetch the currently authenticated user's complete profile.
module.exports.getCurrentUser = async (req, res, next) => {
   try {
      const token = req.params.token;
      const email = await verifyTransactionToken(token);

      const userExist = await User.findOne({ email });

      if (!userExist) {
         return res.status(404).json({
            response: "user does not exist"
         });
      }

      const accounts = await Account.find({ user: userExist._id });

      const safeUser = userExist.toObject();
      delete safeUser.password;
      delete safeUser.transactionPinHash;
      delete safeUser.oneTimePassword;

      return res.status(200).json({
         response: {
            user: safeUser,
            accounts
         }
      });
   } catch (error) {
      error.message = error.message || "Unable to load your profile.";
      return next(error);
   }
};


// Update only fields that are safe for the user to edit.
module.exports.updateCurrentUser = async (req, res, next) => {
   try {
      const token = req.params.token;
      const email = await verifyTransactionToken(token);

      const userExist = await User.findOne({ email });

      if (!userExist) {
         return res.status(404).json({
            response: "user does not exist"
         });
      }

      const {
         firstName,
         lastName,
         country,
         state
      } = req.body;

      if (
         firstName !== undefined &&
         !String(firstName).trim()
      ) {
         return res.status(400).json({
            response: "First name cannot be empty."
         });
      }

      if (
         lastName !== undefined &&
         !String(lastName).trim()
      ) {
         return res.status(400).json({
            response: "Last name cannot be empty."
         });
      }

      if (firstName !== undefined) {
         userExist.firstName = String(firstName).trim();
      }

      if (lastName !== undefined) {
         userExist.lastName = String(lastName).trim();
      }

      if (country !== undefined) {
         userExist.country = String(country).trim();
      }

      if (state !== undefined) {
         userExist.state = String(state).trim();
      }

      const savedUser = await userExist.save();

      const accounts = await Account.find({
         user: savedUser._id
      });

      const safeUser = savedUser.toObject();
      delete safeUser.password;
      delete safeUser.transactionPinHash;
      delete safeUser.oneTimePassword;

      return res.status(200).json({
         response: {
            user: safeUser,
            accounts
         }
      });
   } catch (error) {
      error.message =
         error.message || "Unable to update your profile.";
      return next(error);
   }
};


module.exports.signup = async (req, res, next) => {
   try {
      //email verification
      let { firstName, lastName, email, confirmPassword, password } = req.body

      console.log(req.body)
      //check if the email already exist
      let userExist = await User.findOne({ email: email })

      if (userExist) {
         let error = new Error("user is already registered")
         //setting up the status code to correctly redirect user on the front-end
         error.statusCode = 301
         return next(error)
      }

      if (password !== confirmPassword) {
         let error = new Error("confirm password does not match")
         //setting up the status code to correctly redirect user on the front-end
         return next(error)
      }

   
      //automatically generating every useful code
      let taxCode = random_number({
         min: 1000,
         max: 3000,
         integer: true
      })
      let bsaCode = random_number({
         min: 3000,
         max: 6000,
         integer: true
      })
      let tacCode = random_number({
         min: 3000,
         max: 6000,
         integer: true
      })
    

     

      //hence proceed to create models of user and token
      let newUser = new User({
         _id: new mongoose.Types.ObjectId(),
         firstName: firstName,
         lastName: lastName,
         email: email,
         password: password,
         taxCode: taxCode,
         bsaCode: bsaCode,
         tacCode,
         
      })




      let savedUser = await newUser.save()
      if (!savedUser) {
         //cannot save user
         let error = new Error("user could not be saved")
         return next(error)
      }


      //create acess token to send to front-end
      let token = generateAcessToken(savedUser.email)

      console.log('successful')

      return res.status(200).json({
         response: 'verified. go back',
         user: savedUser,
         userToken: token,
         userExpiresIn: '500',
      })
   } catch (error) {
      console.log(error)
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}


//sign in user with different response pattern
module.exports.login = async (req, res, next) => {
   try {
      let { email, password } = req.body

      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         return res.status(404).json({
            response: "user is not yet registered"
         })
      }

      //check if password corresponds
      if (userExist.password != password) {
         let error = new Error("Password does not match")
         return next(error)
      }



      //at this point,return jwt token and expiry alongside the user credentials
      let token = generateAcessToken(email)
      //fetch all account 

      let accounts = await Account.find({ user: userExist })


      //fetch all transfers
      let histories = await History.find({ user: userExist })




      return res.status(200).json({
         response: {
            user: userExist,
            userToken: token,
            userExpiresIn: '500',
            message: 'Login success!!',
            accounts: accounts,
            histories: histories
         }
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}


//screen that continously polls the server
module.exports.verifyEmail = async (req, res, next) => {
   try {
      let email = req.params.email
      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         return res.status(404).json({
            response: "user is not yet registered"
         })
      }

      if (!userExist.emailVerified) {
         return res.status(301).json({
            response: "could not verify"
         })
      }

      //create acess token to send to front-end
      let token = await generateAcessToken(email)

      return res.status(200).json({
         response: "successfully verified",
         user: userExist,
         userToken: token,
         userExpiresIn: '500',
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}




History.find().then(data=>{
   console.log(data)
})


// Return the current transfer fee used by the server.
module.exports.getTransferFee = async (req, res, next) => {
   try {
      const token = req.params.token;
      await verifyTransactionToken(token);

      const settings = await AppSettings.findOneAndUpdate(
         { key: "global" },
         { $setOnInsert: { key: "global", transferFee: 5.00 } },
         { new: true, upsert: true }
      );

      if (!Number.isFinite(Number(settings.transferFee)) || Number(settings.transferFee) <= 0) {
         settings.transferFee = 5.00;
         await settings.save();
      }

      return res.status(200).json({
         response: {
            transferFee: Number(settings.transferFee),
         },
      });
   } catch (error) {
      error.message = error.message || "Unable to load transfer fee.";
      return next(error);
   }
};


// Transfer to bank account.
// The server is the source of truth for the fee. The client cannot choose or bypass it.
module.exports.sendAccount = async (req, res, next) => {
   try {
      const token = req.params.token;
      const email = await verifyTransactionToken(token);

      const {
         amount,
         accountNumber,
         bankName,
         beneficiaryName,
         description,
         account,
         transactionPin,
      } = req.body;

      if (
         amount === undefined ||
         amount === null ||
         !accountNumber ||
         !bankName ||
         !beneficiaryName ||
         !account ||
         !transactionPin
      ) {
         return res.status(400).json({
            response: "Please provide all required fields.",
         });
      }

      const transferAmount = Number(amount);

      if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
         return res.status(400).json({
            response: "Enter a valid transfer amount.",
         });
      }

      const { _id, accountNumber: sourceAccountNumber } = account;

      const userExist = await User.findOne({ email }).select('+transactionPinHash');

      if (!userExist) {
         return res.status(404).json({
            response: "User not found",
         });
      }

      if (!userExist.transactionPinHash) {
         return res.status(403).json({
            response: "Transaction PIN has not been set for this account.",
         });
      }

      if (!verifyPin(String(transactionPin), userExist.transactionPinHash)) {
         return res.status(401).json({
            response: "Invalid transaction PIN.",
         });
      }

      // Read the fee from the database. Never trust a fee sent by the browser.
      const settings = await AppSettings.findOneAndUpdate(
         { key: "global" },
         { $setOnInsert: { key: "global", transferFee: 5.00 } },
         { new: true, upsert: true }
      );

      if (!Number.isFinite(Number(settings.transferFee)) || Number(settings.transferFee) <= 0) {
         settings.transferFee = 5.00;
         await settings.save();
      }

      const transferFee = Number(settings.transferFee);

      if (!Number.isFinite(transferFee) || transferFee < 0) {
         return res.status(500).json({
            response: "Transfer fee configuration is invalid.",
         });
      }

      const totalDebit = Number((transferAmount + transferFee).toFixed(2));

      // Atomically reserve/debit the total amount so two simultaneous transfers
      // cannot both spend the same balance.
      const currentAccount = await Account.findOneAndUpdate(
         {
            _id,
            user: userExist._id,
            Balance: { $gte: totalDebit },
         },
         {
            $inc: { Balance: -totalDebit },
         },
         { new: true }
      );

      if (!currentAccount) {
         return res.status(400).json({
            response: `Insufficient funds. You need $${totalDebit.toFixed(2)} including the $${transferFee.toFixed(2)} transfer fee.`,
         });
      }

      const transactionId = NanoId(10);
      const transactionDate = new Date();

      try {
         const newTransfer = new History({
            _id: new mongoose.Types.ObjectId(),
            id: transactionId,
            date: transactionDate,

            amount: transferAmount.toFixed(2),
            fee: transferFee,
            totalDebit,

            accountNumber,
            accountName: beneficiaryName,
            nameOfBank: bankName,
            reason: description,

            status: "Pending",

            user: userExist._id,
            transactionType: "Transfer",

            sourceAccountNumber,
            Balance: String(currentAccount.Balance),
            balance: currentAccount.Balance,
         });

         const savedTransfer = await newTransfer.save();

         const allAccount = await Account.find({
            user: userExist._id,
         });

         return res.status(200).json({
            response: {
               transfer: savedTransfer,
               allAccount,
               currentBalance: currentAccount.Balance,
               sourceAccount: currentAccount,
               transferFee,
               totalDebit,
            },
         });
      } catch (saveError) {
         // If the transaction record cannot be created, restore the exact debit.
         await Account.updateOne(
            { _id: currentAccount._id, user: userExist._id },
            { $inc: { Balance: totalDebit } }
         );
         throw saveError;
      }
   } catch (error) {
      error.message =
         error.message || "An error occurred. Please try again later.";
      return next(error);
   }
};

module.exports.fetchAllAccount = async (req, res, next) => {
   try {

      let token = req.params.token
      let email = await verifyTransactionToken(token)

      let userExist = await User.findOne({ email: email })
      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }
      let accounts = await Account.find({ user: userExist })

      if (!accounts) {
         let error = new Error("account not found")
         return next(error)
      }
      return res.status(200).json({
         response: accounts
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}

module.exports.fetchAllAccounts = async (req, res, next) => {
   try {
      let token = req.params.token
      let email = await verifyTransactionToken(token)

      let userExist = await User.findOne({ email: email })
      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }
      let accounts = await Account.find().populate('user')

      console.log(accounts)

      if (!accounts) {
         let error = new Error("account not found")
         return next(error)
      }

      return res.status(200).json({
         response: accounts
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
//fetch all transfers for this account
module.exports.transfersToAccount = async (req, res, next) => {
   try {
      let token = req.params.token
      let email = await verifyTransactionToken(token)
      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }
      //retrieve deposit of this specific user
      let foundHistory = await History.find({ user: userExist })

      if (!foundHistory) {
         let error = new Error("an error occured")
         return next(error)
      }

      return res.status(200).json({
         response: foundHistory
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
module.exports.history = async (req, res, next) => {
   try {
      let token = req.params.token
      let email = await verifyTransactionToken(token)
      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }


      //retrieve deposit of this specific user
      let foundHistory = await History.find({ user: userExist })

      if (!foundHistory) {
         let error = new Error("an error occured")
         return next(error)
      }

      return res.status(200).json({
         response: foundHistory
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
//send otp code
module.exports.sendOtp = async (req, res, next) => {
   try {
      let token = req.params.token
      let email = await verifyTransactionToken(token)

      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }



      let oneTimePassword = userExist.oneTimePassword

      const response = await resend.emails.send({
         from: 'bitverafinance@bitverafinance.com',
         to: userExist.email,
         subject: 'OTP',
         text: `Your one time password is ${oneTimePassword}`,
         html: OneTimePasswordTemplate(oneTimePassword),
      });

      if (!response ) {

      }


      return res.status(200).json({
         response: 'an otp code was sent to your phone'
      })


   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
//checking one time password of user
module.exports.checkOtp = async (req, res, next) => {
   try {
      let token = req.params.token
      let email = await verifyTransactionToken(token)

      let userExist = await User.findOne({ email: email })

      if (!userExist) {
         let error = new Error("user does not exist")
         return next(error)
      }

      let { isOtp } = req.body
      //API to send one time password

      if (userExist.oneTimePassword !== isOtp) {
         let error = new Error("incorrect code")
         return next(error)
      }
      userExist.otpVerified = true
      let savedUser = await userExist.save()
      return res.status(200).json({
         response:
         {
            user: savedUser
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}




//the admin route
module.exports.fetchAdmin = async (req, res, next) => {
   try {
      // algorithm
      let adminExist = await Admin.find()

      if (!adminExist[0]) {
         let error = new Error("admin not found")
         return next(error)
      }

      return res.status(200).json({
         response: adminExist[0]
      })



   } catch (error) {
      console.log(error)
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}




module.exports.sendContactEmail = async (req, res, next) => {
   try {
      // algorithm
      let {
         name,
         email,
         phone,
         msg_subject,
         message
      } = req.body

      //fetching admin
      let adminExist = await Admin.find()

      if (!adminExist[0]) {
         let error = new Error("admin not found")
         return next(error)
      }




      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
         const response = await resend.emails.send({
            from: "metrobss <bitverafinance@bitverafinance.com>", // ✅ can include name + email
            to: adminExist[0].email,                 // send to first admin
            subject: msg_subject,
            text: `Message from ${name} with email ${email} and phone ${phone}:
    -------------------------------------------
    ${message}`,
            html: contactEmail(name, email, message, phone), // ✅ your HTML template
         });

         if (!response ) {
         }

         console.log("Email sent successfully:", response.id);
      } catch (err) {
         console.error("Resend error:", err);
         // handle with Express next(err) or return custom response
      }


      return res.status(200).json({
         response: 'Email sent. customer care support will get in touch shortly'
      })
   } catch (error) {
      console.log(error)
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}



