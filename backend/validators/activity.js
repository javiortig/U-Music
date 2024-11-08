const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")
const User = require("../models/user");
const Activity = require("../models/activity");
const Reservations = require( "../models/reservation");

const validateCreateActivity = [
    check('title').exists().notEmpty(),
    check('description').optional(),
    check('total_places').exists().notEmpty().isInt(),
    check('type').isIn(['open', 'closed']).exists().notEmpty(),
    check('genre').isArray().optional(),
    check('recurrent').isBoolean().exists().notEmpty(),
    check('users').isArray().optional(),
    check('instruments').isArray().notEmpty().exists(),
    check('sessions').isArray().notEmpty().exists(),

       
    (req, res, next) => {
        return validateResults(req, res, next);
    }

];

const validateUpdateActivity = [
    check('title').optional(),
    check('description').optional(),
    check('total_places').optional().isInt(),
    check('type').isIn(['open', 'closed']).optional(),
    check('genre').isArray().optional(),
    check('users').isArray().optional(),
    check('instruments').isArray().optional(),
    check("admins").optional().isArray(),
       
    (req, res, next) => {
        return validateResults(req, res, next);
    }

];

const validateAddUserToActivity = [

    check('instrument').exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }

];


module.exports = { validateCreateActivity, validateUpdateActivity,  validateAddUserToActivity}