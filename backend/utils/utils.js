const jwt = require("jsonwebtoken")
require("dotenv").config()
const { User, Admin } = require("../database/databaseConfig")

const secret = process.env.SECRET_KEY
module.exports.generateAcessToken = (email) => {
    let token = jwt.sign({ email: email }, secret, { expiresIn: "500h" })
    return token
}


module.exports.verifyUser = async (req, res, next) => {
    try {
        let token = req.headers["header"]
        if (!token) {
            throw new Error("a token is needed")
        }
        const decodedToken = jwt.verify(token, secret)
        let user = await User.findOne({ email: decodedToken.email })

        req.user = user
        next()

    } catch (err) {
        console.log(err)
        let error = new Error("not authorize")
        error.statusCode = 301
        error.message = err.message
        return next(error)
    }
}


module.exports.verifyAdmin = async (req, res, next) => {
    try {
        let token = req.headers["header"]
        if (!token) {
            throw new Error("a token is needed")
        }
        const decodedToken = jwt.verify(token, secret)
        let admin = await Admin.findOne({ email: decodedToken.email })
        req.admin = admin
        console.log(req.Admin)
        next()

    } catch (err) {
        console.log(err)
        let error = new Error("not authorize")
        error.message = err.message
        return next(error)
    }
}

module.exports.verifyTransactionToken = async (token) => {
    const decodedToken = jwt.verify(token, secret)
    return decodedToken.email
}

module.exports.WelcomeTemplate = (email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">WELCOME MESSAGE </h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">
    
    Dear ${email}, welcome to metrobss,Smart-free banking for everybody.
                      Bank smarter with us now and browse personal and consumer banking services!
    </p>

   
    <h2 style=" margin-bottom:30px; width: 100%; text-align: center ">For your information </h2>

</div>`

}

module.exports.NotifyAdmin = (email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">WELCOME MESSAGE </h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">
    
    A new user with the email ${email} just registered!
    </p>

   
   



    


</div>`

}

module.exports.verifyEmailTemplate = (verifyUrl, email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">ACCOUNT VERIFICATION </h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">To verify the email to your account,click the verification link below</p>

    <p style={{ margin-bottom: 40px; width: 100%; text-align:center; }}>
        <a style=" color: blue; font-size: .8rem;text-align:center" href='${verifyUrl}'>
        ${verifyUrl}
        </a>
    </p>

    

    


</div>`

}

module.exports.passwordResetTemplate = (resetUrl, email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">metrobss.cloud PASSWORDRESET </h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">To reset the password to your metrobss account,click the RESET link below</p>

    <p style={{ margin-bottom: 40px; width: 100%; text-align:center; }}>
        <a style=" color: blue; font-size: .8rem;text-align:center" href='${resetUrl}'>
        ${resetUrl}
        </a>
    </p>

   

    


</div>`

}
module.exports.upgradeTemplate = (fundBalance, email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">metrobss.cloud Credited </h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your metrobss account has  been credited with $ ${fundBalance} to start trading with. Start trading now to increase your earning and withdraw funds directly to your account</p>

    

    <h2 style=" margin-bottom:30px; width: 100%; text-align: center ">For your information </h2>


</div>`

}

module.exports.removeSpaces = (numStr) => {
    let res = ''
    for (let char of numStr) {
        if (char === ' ') continue
        res += char
    }
    return res
}

module.exports.TransferRequestTemplate = (amount, accountNumber, name, account, date) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your request to transfer $${amount} from your  account ${accountNumber} to ${name} with account number  ${account} on ${date} has been recieved and awaiting approval. Contact admin if there is an issue of delay</p>

    

    






</div>`

}


module.exports.AdminTransferRequestTemplate = (email) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">A user with the email ${email} made a transfer request</p>

    

    






</div>`

}





module.exports.CreditTemplate = (amount, date) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center "> CREDIT</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your Account have been credited with the sum of $${amount}  on ${date}</p>

    






</div>`

}

module.exports.Approval = () => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center "> ACCOUNT APPROVAL</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your Account has been approved .You can now make transfer, deposit and withdraw !!</p>
</div>`

}

module.exports.DebitRequestTemplate = (amount) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your request to withdraw $${amount} has been recieved and would be approve.Contact admin if any delay arises</p>

    
</div>`

}

module.exports.AdminDebitRequestTemplate = (email,amount) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">A user with the email ${email} made a withdrawal request of $${amount}</p>

    
</div>`

}



module.exports.DepositRequestTemplate = (amount) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center "> DEPOSIT REQUEST</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your deposit request of $${amount} ws recieved and awaiting approval. Contact admin to make the actual payment</p>

    
</div>`

}


module.exports.AdminDepositRequestTemplate = (email) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center "> DEPOSIT REQUEST</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">A user with the email $${email} made a deposit request</p>

    
</div>`

}






module.exports.OneTimePasswordTemplate = (password) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your one time password is ${password}</p>

</div>`

}


module.exports.SendEmailTemplate = (email) => {
    return `
<div>
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">${email}</p>
</div>`

}


module.exports.TransactionApproval = (transactionType, amount) => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">${transactionType}: ${transactionType} of $${amount} was successful</p>
</div>`

}



module.exports.AdminCredit = (accountType, amount) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">CREDIT ALERT</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">your ${accountType} account has been credited with $${amount}</p>
</div>`

}

module.exports.AdminDebit = (accountType, amount) => {
    return `
    <div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">DEBIT ALERT</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">your $${accountType} account has been debited with ${amount}</p>
</div>`

}

module.exports.AccountCreated = (accountType, accountNumber) => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">
    New Account: ${accountType} account has been created with an account number ${accountNumber}</p>
</div>`

}



module.exports.LoanRequestTemplate = (amount) => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your request for a loan of $${amount} has been recieved and awaiting approval! </p>
</div>`

}


module.exports.AdminLoanRequestTemplate = (email) => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">A user with the email ${email} request a loan  ! </p>
</div>`

}

module.exports.LoanApproval = (amount) => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your loan request of $${amount} has been approved</p>
</div>`

}

module.exports.CardRequestTemplate = (email, cardType) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Dear ${email}, your request for a ${cardType} has been recieved and awaiting approval.Ensure there is an available balance of $500 on your saving account hence request will eventually be disapproved!</p>

</div>`

}

module.exports.AdminCardRequestTemplate = (email, cardType) => {
    return `
<div >
    

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">
    A user with the email ${email}, request for a card of type ${cardType} </p>

</div>`

}



module.exports.CardApproval = () => {
    return `
<div >

    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Your card request  has been approved</p>
</div>`
}


module.exports.SenderRequestTemplate = (amount, accountNumber, recieverName, recieverAccount, date) => {
    return `
<div >
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">Transfer of $${amount} from your  account ${accountNumber} to ${ recieverName} with account number  ${recieverAccount} on ${date} was successful</p>
</div>`

}



module.exports.RecieverRequestTemplate = (amount, accountNumber, firstName, lastName) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background: #03A9F4; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0;">Credit Alert</h2>
        <p style="margin: 5px 0 0; font-size: 0.9rem;">Transaction Successful</p>
      </div>

      <!-- Body -->
      <div style="padding: 25px;">
        
        <p style="font-size: 0.95rem; color: #333;">Hello,</p>

        <p style="font-size: 0.95rem; color: #333;">
          Your account has been successfully credited. Below are the transaction details:
        </p>

        <!-- Transaction Card -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          
          <p style="margin: 8px 0; font-size: 0.9rem;">
            <strong>Amount:</strong> 
            <span style="color: #28a745; font-weight: bold;">+$${amount}</span>
          </p>

          <p style="margin: 8px 0; font-size: 0.9rem;">
            <strong>Account Number:</strong> ${accountNumber}
          </p>

          <p style="margin: 8px 0; font-size: 0.9rem;">
            <strong>Sender:</strong> ${firstName} ${lastName}
          </p>

          <p style="margin: 8px 0; font-size: 0.9rem;">
            <strong>Status:</strong> 
            <span style="color: #28a745;">Completed</span>
          </p>

        </div>

        <p style="font-size: 0.9rem; color: #555;">
          If you did not authorize this transaction, please contact support immediately.
        </p>

        <p style="font-size: 0.9rem; color: #555; margin-top: 20px;">
          Thank you for using our service.
        </p>

      </div>

      <!-- Footer -->
      <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 0.75rem; color: #888;">
        © ${new Date().getFullYear()} . All rights reserved.
      </div>

    </div>
  </div>
  `;
};




module.exports.AdminCreditCard = (cardNumber, amount) => {
    return `
<div >
    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">----------------------</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">CREDIT ALERT</h2>

    <h2 style=" margin-bottom: 30px; width: 100%; text-align: center ">-------------------------</h2>
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">your card with number ${cardNumber} has been funded with ${amount}</p>
</div>`

}




module.exports.contactEmail = (name,email,message,phone) => {
    return `
<div >
    <p style=" margin-bottom: 40px; width: 100%;text-align: center;font-size:1rem">message from ${name} with email ${email} with the phone ${phone}:
    <br>
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    <br>
    ${message}</p>

</div>`

}





