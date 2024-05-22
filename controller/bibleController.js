const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const localStorage = require("localStorage");
var base64url = require("base64url");
var crypto = require("crypto");
const moment = require("moment");
var FCM = require("fcm-node");
const fs = require("fs");
const axios = require("axios");
require("moment-timezone");
const config = require("../config");
const logError = require('../logger/errorHandler'); // Import the logError function


const {
    insertData,
    updateData,
    getData,
    deleteData,
    fetchCount,
    getSelectedColumn,
    filtertags,
} = require("../models/common");


exports.getBibleBooksByVersion = async (req, res, next) => {
    try {
        const { version_id } = req.params;
        const result = await getData("versions", `where id = ${version_id}`);

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Unable to get the data",
            });
        } else {
            if (result[0].name == 'King James Version') {
                var parse_Bible = JSON.parse(result[0].bible_json)
            }
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: parse_Bible,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};

exports.getBibleVersion = async (req, res, next) => {
    try {
        const { version_id } = req.query;
        const result = await getSelectedColumn('id,name,table_name', 'versions', '');
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Unable to know amount of cash in bank",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        logError('/get_cashInBank', error, next);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getBibleVerses = async (req, res, next) => {
    try {
        const { table_name, book_name, chatperNo, verse_number } = req.body;

        const result = await getData(table_name, `where book_name = '${book_name}' and chapter = ${chatperNo} and verse_number = ${verse_number}`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
}


exports.saveBibleVerses = async (req, res, next) => {
    try {
        const { verse_number, verse, book_name, chapter, notes } = req.body;
        const user_id = req.user_id;

        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                verse_number: [Joi.string().empty().required()],
                verse: [Joi.string().empty().required()],
                book_name: [Joi.string().empty().required()],
                chapter: [Joi.string().empty().required()],
                notes: [Joi.string().optional(), Joi.allow(null)]

            })
        );
        const validateResult = schema.validate(req.body);
        if (validateResult.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: validateResult.error.details[0].message,
                error: message,
                missingParams: validateResult.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const user = {
                version: "KJV",
                verse_number: verse_number,
                verse: verse,
                book_name: book_name,
                chapter: chapter,
                notes: notes,
                user_id: user_id

            };
            const result = await insertData('saved_verses', user, '');
            return res.json({
                success: true,
                message: "Successfully saved",

            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
}
exports.saveEditedBibleVerses = async (req, res, next) => {
    try {
        const { verse_number, verse, notes } = req.body;
        const user_id = req.user_id;


        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                verse_number: [Joi.string().empty().required()],
                verse: [Joi.string().empty().required()],
                notes: [Joi.string().optional(), Joi.allow(null)]

            })
        );
        const validateResult = schema.validate(req.body);
        if (validateResult.error) {
            const message = validateResult.error.details.map((i) => i.message).join(",");
            return res.json({
                message: validateResult.error.details[0].message,
                error: message,
                missingParams: validateResult.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const user = {
                verse_number: verse_number,
                verse: verse,
                notes: notes,
                user_id: user_id

            };
            const result = await insertData('edited_verse', user, '');
            return res.json({
                success: true,
                message: "Successfully saved",

            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getBibleVerseOfTheDay = async (req, res, next) => {
    try {

        const getRandonResult = await getData('random_verse', `where created_at = CURRENT_DATE`);

        if (getRandonResult.length === 0) {
            const generateRandom = await getData('kjvbible', `order by rand() limit 1`);

            const random = {
                verse_number: generateRandom[0].verse_number,
                verse: generateRandom[0].verse,
                book_name: generateRandom[0].book_name,
                chapter: generateRandom[0].chapter
            }
            const insertRandonData = await insertData('random_verse', random, '')
            // User not found
            return res.json({
                success: true,
                message: "found successfully",
                data: getRandonResult[0]
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "Found successfully",
                data: getRandonResult[0]
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getPastRandomVerses = async (req, res, next) => {
    try {

        const result = await getData('random_verse', '');
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
}
exports.getSavedVerses = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const result = await getData('saved_verses', `where user_id = ${user_id}`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getEditedVerses = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const result = await getData('edited_verse', `where user_id = ${user_id}`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.addFriends = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const { name, email } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                name: [Joi.string().empty().required()],
                email: [Joi.string().empty().required()]

            })
        );
        const validateResult = schema.validate(req.body);
        if (validateResult.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: validateResult.error.details[0].message,
                error: message,
                missingParams: validateResult.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const user = {
                user_id: user_id,
                name: name,
                email: email
            };
            const result = await insertData('friends_list', user, '');
            return res.json({
                success: true,
                message: "Successfully saved",

            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getFreidns = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const result = await getData('friends_list', `where user_id = ${user_id}`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};



exports.getBibleVersesByKeyword = async (req, res, next) => {
    try {
        const { table_name, book_name, keyword } = req.body;



        const result = await getData(table_name, `where book_name = '${book_name}' and verse  LIKE '%${keyword}%'`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.testament = async (req, res, next) => {
    try {

        const result = await getData('old_testament', '');
        const result2 = await getData('new_testament', '');
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Unable to know amount of cash in bank",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
                data2: result2,
            });
        }
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};

exports.getChapters = async (req, res, next) => {
    try {
        const { table_name, book_name, chatperNo } = req.body;

        const result = await getData(table_name, `where book_name = '${book_name}' AND chapter = ${chatperNo}`);
        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};


exports.getBooksByVersion = async (req, res, next) => {
    try {
        const { table_name } = req.body;

        const result = await getSelectedColumn('book_name', table_name, `GROUP by book_name ORDER by id ASC`);

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};



exports.getChaptersNo = async (req, res, next) => {
    try {
        const { table_name, book_name } = req.body;

        const result = await getSelectedColumn('chapter', table_name, `where book_name = '${book_name}' GROUP by chapter ORDER by id ASC`);

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};

exports.getVerseNo = async (req, res, next) => {
    try {
        const { table_name, book_name, chatperNo } = req.body;

        const result = await getSelectedColumn('verse_number', table_name, `where book_name = '${book_name}' and chapter = ${chatperNo}`);


        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};



exports.uploadCardTemplate = async (req, res) => {
    try {




        const user_id = req.user_id;
        let filename = "";
        if (req.file) {
            const file = req.file;
            filename = file.filename;
        }
        const userInfo = await fetchUserBy_Id(user_id);
        if (userInfo.length !== 0) {

            const data = {
                image: filename
            };


            const result = await insertData('card_template', data, '');
            if (result.affectedRows) {
                return res.json({
                    message: "update user successfully",
                    status: 200,
                    success: true,
                });
            } else {
                return res.json({
                    message: "update user failed ",
                    status: 200,
                    success: false,
                });
            }
        } else {
            return res.json({
                messgae: "data not found",
                status: 200,
                success: false,
            });
        }

    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error",
            error: err,
            status: 500,
        });
    }
};

exports.getCardTemplate = async (req, res, next) => {
    try {

        const result = await getData('card_template', '');

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};

exports.uploadsuggested_links = async (req, res) => {
    try {

        const { links } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                links: [Joi.string().empty().required()]
            })
        );
        const validateResult = schema.validate(req.body);
        if (validateResult.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: validateResult.error.details[0].message,
                error: message,
                missingParams: validateResult.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user_id;
            let filename = "";
            if (req.file) {
                const file = req.file;
                filename = file.filename;
            }
            const userInfo = await fetchUserBy_Id(user_id);
            if (userInfo.length !== 0) {

                const data = {
                    image: filename,
                    links: links
                };


                const result = await insertData('suggested_links', data, '');
                if (result.affectedRows) {
                    return res.json({
                        message: "update user successfully",
                        status: 200,
                        success: true,
                    });
                } else {
                    return res.json({
                        message: "update user failed ",
                        status: 200,
                        success: false,
                    });
                }
            } else {
                return res.json({
                    messgae: "data not found",
                    status: 200,
                    success: false,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error",
            error: err,
            status: 500,
        });
    }
};

exports.getSuggestedLinks = async (req, res, next) => {
    try {

        const result = await getData('suggested_links', '');

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};

exports.updateBanner = async (req, res) => {
    try {
    
   

        const user_id = req.user_id;
  
        let filename = "";
        if (req.file) {
          const file = req.file;
          filename = file.filename;
        }
  
        const user_info = await fetchUserBy_Id(id);
        const updated_info = {
          name: name ? name : user_info[0]?.name,
          phone_no: phone_no ? phone_no : user_info[0]?.phone_no,
          profile_image: filename ? filename : user_info[0]?.image,
        };
  
        const check = await updateUserById(updated_info, id);
        const data = await fetchUserBy_Id(id);
        return res.json({
          status: 200,
          success: true,
          message: "User Update Successfull",
          user_info: data,
        });
      
    } catch (error) {
      return res.json({
        success: false,
        message: "Internal server error",
        status: 500,
        error: error,
      });
    }
  };

 
  exports.updateBanners = async (req, res, next) => {
    try {
       
        let sidebar_image = false;
        let small_image = false;
        let big_image = false;
   
        if (req.files.sidebar_image) {
            sidebar_image = req.files.sidebar_image[0]?.filename;
        }
        if (req.files.small_image) {
            small_image = req.files.small_image[0]?.filename;
        }
        if (req.files.big_image) {
            big_image = req.files.big_image[0]?.filename;
        }
      

        const getMisc = await getData('banners', '');

        const updated_info = {
            sidebar_image: sidebar_image ? sidebar_image : getMisc[0]?.sidebar_image,
            small_image: small_image ? small_image : getMisc[0]?.small_image,
            big_image: big_image ? big_image : getMisc[0]?.big_image
        };
        const updateHome = await updateData( 'banners',updated_info, 'where id = 1');
   
        if (updateHome.affectedRows > 0) {
            return res.json({
                status: 200,
                success: true,
                message: "Update Successfully",
            });
        } else {
            return res.json({
                status: 200,
                success: true,
                message: "Unable to update",
            });
        }
    } catch (error) {
    
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500,
            error: error,
        });
    }
};

exports.getbanners = async (req, res, next) => {
    try {

        const result = await getData('banners', '');

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found",
            });
        } else {
            // User found
            return res.status(200).json({
                success: true,
                message: "found successfully",
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later.",
            status: 500,
            error: error.message,
        });
    }
};






