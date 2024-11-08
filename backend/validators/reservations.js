const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")
const User = require("../models/user");
const Activity = require("../models/activity");
const Reservations = require( "../models/reservation");
const { validate } = require("../models/classroom");

const validateAddReservation = [
    check('date').exists().notEmpty(),
    check('time_slot').exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }


];

const validateUpdateReservation = [ 
    check('date').optional(),
    check('time_slot').optional(),
    check('classroom_id').optional(),
    
    (req, res, next) => {
        return validateResults(req, res, next);
    }

];

const validateReserveClassroom = [
    check('classroomNumber').exists().notEmpty(),
    check('date').exists().notEmpty(),
    check('time_slot').exists().notEmpty(),
    check('building').exists().notEmpty(),
    check('extra').optional(),

    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validateAddReservation, validateUpdateReservation,validateReserveClassroom};