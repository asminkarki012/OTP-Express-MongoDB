const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const path = require('path')
const bcrypt = require("bcryptjs")
require('dotenv').config();
// mongoose
const mongoose = require("mongoose")
const User = require("./UserSchema")

// setup in env variable
mongoose.connect(`mongodb+srv://pramod:${process.env.DBPASS}@cluster0.ndhcz.mongodb.net/Endavour?retryWrites=true&w=majority`, () => {
    console.log("MongoDB connected")
})

async function addUser (Cemail, res) {
    const userExists = await User.exists({email: `${Cemail}`})
    console.log("userExists", userExists)
    if (userExists) {
        console.log("User Already Exists!")
        res.send({
            msg:"redirect",
            to: `/enterotp/${Cemail}`
        })
    }
    else {
        console.log("New User!")
        res.send({
            msg:"redirect",
            to: `/register/${Cemail}`
        })
    }
    
}

async function generateHash (code, email) {
    console.log("inside generateHash",email)
    const userExists = await User.exists({email: `${email}`})
    if (userExists) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(`${code}`, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    console.log(err)
                }
                else {
                    User.updateOne({email: `${email}`},
                        {code:`${hash}`}, function (err, docs) {
                        if (err){
                            console.log(err)
                        }
                        else{
                            console.log("Updated Docs : ", docs);
                        }
                    });
                }
            });
        });
    }
    else {
        console.log("Email is not registered!")
    }
}



function checkCode (hash) {
    bcrypt.compare(`${hash}`, hash, function(err, res) {
        console.log(res)
    });
}


//mongoose

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const pug = require('pug');
const UserSchema = require("./UserSchema")
app.set('view engine', 'pug')

// nodemailer

const mailer = async (recepient,otp) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GMAIL_ACC}`,
        pass: process.env.APP_PASS, //app password
      },
    });
  
    const mailOptions = {
      from: `${process.env.GMAIL_ACC}`,
      to:`${recepient}`,
      subject: "OTP",
      text: `Your OTP code is ${otp}`,
    };
    await transporter.verify();
  
    //send email
    transporter.sendMail(mailOptions, function (err, res) {
      if (error) {
    return res.status(400).send({"Status":"Failure","Details": err });
  
      } else {
         return res.send({"Status":"Success","Details":encoded});
      }
    });
}

// nodemailer

//twiolo sms
function sendSms (code, phoneNo) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
    .create({
        body: `Your OTP code is ${code}`,
        from: `${process.env.TWILIO_PHONE}`,
        to: `${phoneNo}`
    }).then(message => console.log(message.sid));
}

//checking if the email exists 

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/enterotp/:email', async (req, res) => {
    console.log(req.params.email)
    const code = Math.floor(Math.random()*999999)
    console.log(code)
    // Hasing function
    const userExists = await User.exists({email: `${req.params.email}`})
    if (userExists) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(`${code}`, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("stored in db", hash)
                    User.updateOne({email: `${req.params.email}`},
                        {code:`${hash}`}, async function (err, docs) {
                        if (err){
                            console.log(err)
                        }
                        else{
                            console.log("Updated Docs : ", docs);
                            const userinfo = await User.findOne({email: req.params.email});
                            const contact_no = userinfo.contact_no
                            mailer(`${req.params.email}`, `${code}`)
                            sendSms(`${code}`, `+977${contact_no}`)
                        }
                    });
                }
            });
        });
    }
    else {
        console.log("Email is not registered!")
    }

    res.render('otp', {email:`${req.params.email}`})
    
})

app.get('/register/:email', (req, res) => {
    res.render('register', {email: req.params.email})
})


app.post('/users/signup', async (req, res) => {
    console.log(req.body)
    const userExists = await User.exists({email: `${req.body.email}`})
    if (userExists) {
        console.log("User Already Exists!")
        res.send({
            msg:"redirect",
            to: `/enterotp/${req.body.email}`
        })
    }
    else {
        console.log("unique user to be registered")
        try {
            const newUser = await User.create({
                fullname: `${req.body.fullname}`,
                adress: `${req.body.adress}`,
                email: `${req.body.email}`,
                contact_no: req.body.contact_no,
                dob: req.body.dob,
                code: null
            })
            console.log(newUser)
            res.send({
                msg:"redirect",
                to: `/enterotp/${req.body.email}`
            })
        }
        catch(err) {
            console.log("error occured", err)
        }
    }
})

app.get('/emailCheck', (req, res) => {
    console.log(req.query.email)
    const email = req.query.email
    addUser (email, res)
})

async function getHash (email) {
    try {
        
        return ans.code
    }
    catch {}
}

app.post('/checkOtp', async (req, res) => {
    const {email} = req.body
    console.log(email);
    const userCode = req.body.code
    // get userifo along with hash code
    const userinfo = await User.findOne({email: email})
    const convertedDate = userinfo.dob.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    
    userinfo.dobConverted = convertedDate
    const hash = userinfo.code
    // get comparing hash code

    const compare = bcrypt.compareSync(`${userCode}`, hash)
    console.log(compare)
    if (compare) {
        res.render('dashboard', {userinfo})
    }
    else {
        res.render('wrongcode', {email: email})
    }

})

app.use(express.static('public'))

app.listen(3000, () => {
    console.log("listening at 3000")
})