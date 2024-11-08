const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")
const User = require("../models/user");

const validatorRegister = [
    // check("name").exists().notEmpty().isLength({ min: 3, max: 99 }),
    check("password").exists().notEmpty().isLength({ min: 8, max: 16 }).matches(/^(?=.*[0-9])(?=.*[A-Z])/),
    check('nickname').exists().notEmpty().isLength({ min: 3, max: 99 }).custom(async (value) => {
        const user = await User.findOne({ where: { nickname: value } });
        if (user) {
            throw new Error('Nickname already in use');
        }
    }),
    check("instruments").exists().notEmpty().isArray(), 
    check("receiveNotifications").exists().notEmpty().isBoolean(),
    check("bio").notEmpty().optional(),
    check("availabilitySchedule").notEmpty().optional(),
    
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorLogin = [
    check("email").exists().notEmpty().matches(/^[^@]+@(live\.u-tad\.com|u-tad\.com)$/),
    check("password").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

const validatorCheckEmail = [
   check("email").exists().notEmpty().matches(/^[^@]+@(live\.u-tad\.com|u-tad\.com|ext\.live\.u-tad\.com)$/).custom(async (value) => {
        const user = await User.findOne({ email: value });
            console.log("User found:", user);
            if (user) {
                throw new Error('Email already in use');
            }
    }),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

module.exports = { validatorRegister, validatorLogin, validatorCheckEmail }