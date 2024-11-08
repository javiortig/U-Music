const express = require('express');
const fs = require('fs');
const router = express.Router();

// Remove file extension
const removeExtension = (filename) => {
    return filename.split('.').shift();
}

//lee el directo
fs.readdirSync(__dirname).filter((file) => {
    const name = removeExtension(file);
    if (name !== 'index') {
        router.use("/" + name, require("./" + name));
    }
});

module.exports = router;


