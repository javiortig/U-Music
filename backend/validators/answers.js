const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")

const validateCreateAnswer = [
    check('content').exists().notEmpty(),
    check('postId').exists().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validateUpdateAnswer = [
    check('content').optional(),

    (req, res, next) => {
        return validateResults(req, res, next);
    }


];

module.exports = {validateCreateAnswer, validateUpdateAnswer}
