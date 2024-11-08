const {validationResult} = require('express-validator');

const validateResults = (req, res, next) => {
    try{
        //console.log("Validating results...")
        validationResult(req).throw();
        next();
    }
    catch(err){
        console.log("Validation failed...")
        res.status(403)
        res.send({errors: err.array()})
        console.log(err)
    }
}

module.exports =  validateResults 