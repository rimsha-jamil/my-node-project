const { check } = require('express-validator');

const registerValidation = [
  check('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 15 }).withMessage('Name must be at most 15 characters.')
    .matches(/^[A-Za-z ]+$/).withMessage('Name may contain only letters and spaces.'),
  check('phone')
    .notEmpty().withMessage('Phone is required.')
    .matches(/^(?:\+92|0)3\d{2}-?\d{7}$/).withMessage('Phone must be a valid Pakistani mobile number.'),
  check('age')
    .isInt({ min: 19, max: 49 }).withMessage('Age must be between 19 and 49.'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[A-Za-z])/).withMessage('Password must contain at least one letter.')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one number.')
    .matches(/(?=.*[!@#$%^&*()_\-=\[\]{};':"\\|,.<>\/?])/).withMessage('Password must contain at least one special character.'),
];

module.exports = { registerValidation };
