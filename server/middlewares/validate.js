const { body, validationResult } = require('express-validator');

const validateInput = [
    body('subject').isString(),
    body('user_response').isString(),
    body('topic').isString(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation Error")
            return res.status(400).json({
                message: "Invalid input data",
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = validateInput;