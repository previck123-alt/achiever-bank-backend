const mongoose = require("mongoose")



mongoose.connect(process.env.DB_STRING).then(() => {
    console.log("connected to database")
})


const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    
   
    country: {
        type: String
    },
    state: {
        type: String
    },
   
   
    taxCode: {
        type: String,
    },
    bsaCode: {
        type: String,
    },
    tacCode: {
        type: String,
    },
    oneTimePassword: {
        type: String,
    },
    taxVerified: {
        type: Boolean,
        default: false
    },
    bsaVerified: {
        type: Boolean,
        default: false
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    tacVerified: {
        type: Boolean,
        default: false
    },
})

const AdminSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },

    location: {
        type: String,
    },

    phone: {
        type: String,
    },
    fax: {
        type: String,
    },

    address: {
        type: String,
    },






})


const HistorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: {
        type: String,
    },
    
    Balance:{
         type: String,
    },
    // Post-transaction balance kept for receipts and transaction history.
    balance:{
         type: Number,
    },
    nameOfCountry: {
        type: String,
    },
    nameOfBank: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: String,
    },
    transactionType: {
        type: String,
    },
    accountName: {
        type: String,
    },
    accountNumber: {
        type: String,
    },
    routeNumber: {
        type: String,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        default: 'Pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sourceAccountNumber: {
        type: String,
    },
})


const AccountSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accountNumber: {
        type: String,
    },
    accountType: {
        type: String,
    },
    Balance: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

})





let User = new mongoose.model("User", userSchema)
let Admin = new mongoose.model("Admin", AdminSchema)
let History = new mongoose.model("History", HistorySchema)


let Account = new mongoose.model('Account', AccountSchema)

module.exports.User = User
module.exports.Admin = Admin
module.exports.History = History
module.exports.Account = Account