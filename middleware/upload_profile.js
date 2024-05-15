const multer = require('multer')
const path = require('path')
const hash = require('random-hash');

const storage_profile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/profile/");
    },
    filename: (req, file,cb) => {
             let temp = file.originalname.replace(/\s+/g, '').split('.'); //temp[0] +
                const filename = hash.generateHash({ length: 10 }) + '.' + temp[1]
                //cb(null, filename);
                cb(null, new Date().getTime() + path.extname(file.originalname))
            }
});

const upload_profile = multer({ storage: storage_profile });

module.exports = upload_profile


