const { check } = require("express-validator")
const validateResults = require("../validators/handleValidator")

const validateCreatePost = [
    check('title').optional(),
    check('content').exists().notEmpty(),
    check('tag').isArray().optional(),
    check('activity').optional(),

    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

const validateUpdatePost = [
    check('title').optional(),
    check('content').optional(),
    check('tag').isArray().optional(),

    (req, res, next) => {
        return validateResults(req, res, next);
    }


];

module.exports = {validateCreatePost, validateUpdatePost}

