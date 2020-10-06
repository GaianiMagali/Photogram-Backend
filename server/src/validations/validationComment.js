const { check } = require("express-validator");

const ValidationComment = {
    comment: [
        check("body", "El comentario no puede estar vacio").not().isEmpty()
    ]
}

module.exports = ValidationComment;