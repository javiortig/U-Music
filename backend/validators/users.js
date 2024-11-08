const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")
const User = require("../models/user");

const validatorUserUpdate = [

    check("name").optional().notEmpty().isLength({ min: 3, max: 99 }),
    check('nickname').optional().notEmpty().isLength({ min: 3, max: 99 }).custom(async (value) => {
        const user = await User.findOne({ where: { nickname: value } });
        if (user) {
            throw new Error('Nickname already in use');
        }
    }),
    check("instruments").optional().notEmpty().isArray(), 
    check("bio").notEmpty().optional(), 
    check("receiveNotifications").notEmpty().isBoolean().optional(),
    check("availabilitySchedule").notEmpty().optional(),
    //.isJSON()
    
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validatorUserUpdatePassword = [

    check("password").exists().notEmpty().isLength({ min: 8, max: 16 }).matches(/^(?=.*[0-9])(?=.*[A-Z])/),
    
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorUserUpdate, validatorUserUpdatePassword }; 