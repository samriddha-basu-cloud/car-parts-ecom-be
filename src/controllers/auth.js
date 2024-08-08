const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { generateAccessToken } = require('../utils/helper/helper');
const mailSender = require('../utils/mailSender');
const welcomeEmail = require('../utils/templates/welcome');

const sendOtp = async (req, res) => {

    try {

        const { email } = req.body;
        
        if (!email) {
            return res.json({
                message: 'Email is required' 
            })
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({
                message: 'User is already registered' 
            })
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        
        const result = await OTP.findOne({ otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });        
        }

        const newOtp = new OTP({
            email,
            otp
        });

        await newOtp.save();

        return res.json({
            message: 'OTP sent successfully', 
        })

    } catch (err) {
        return res.json({
            message: err.message
        })
    }
}

const register = async (req, res) => {
    try {

        const { name, email, password, otp, confirmPassword , phoneNumber} = req.body;
        
        if (!name || !email || !password ||!otp) {
            return res.json({
                message: 'All fields are required' 
            })
        }

        if (password !== confirmPassword) {
            return res.json({
                message: 'Passwords do not match' 
            })
        }

        const oldUser = await User.findOne({ email });


        if (oldUser) {
            return res.json({
                message: 'User already registerd' 
            })
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({
                message: 'Invalid email address' 
            })
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.json({
                message: 'Invalid phone number' 
            })
        }

        const response = await OTP.findOne({ email }).sort({ createdAt: -1 });
     
        if (!response) {
            return res.json({
                message: 'OTP not found' 
            })
        }
       

        if (response.otp !== otp) {
            return res.json({
                message: 'Invalid OTP' 
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);


        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            confirmPassword: hashedConfirmPassword,
            phoneNumber,
        })

        user.save();

        await mailSender(user.email, 'Welcome to our platform', welcomeEmail(user.name));

        user.password = undefined;
        user.confirmPassword = undefined;
        return res.json({
            message: 'User registered successfully',
            user
        })

    } catch (e) {
        return res.json({
            message: e.message
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({
                message: 'All fields are required' 
            })
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.json({
                message: 'User not found' 
            })
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.json({
                message: 'Invalid Creds' 
            })
        }

        const accessToken = generateAccessToken({ _id: user._id })

        return res.json({
            message: 'Login successful',
            accessToken,
        })

    } catch (e) {
       return res.json({
            message: e.message
        })
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -confirmPassword');
        return res.json({
            message: 'User fetched successfully',
            user
        })
    } catch (e) {
        return res.json({
            message: e.message
        })
    }
}



module.exports = { sendOtp,register, login, getProfile };