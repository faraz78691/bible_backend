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
const sgMail = require('@sendgrid/mail')


const {
    insertData,
    updateData,
    getData,
    deleteData,
    fetchCount,
    getSelectedColumn,
    filtertags,
    getUnionData,
    getBookName,
    getChaptersNo,
    getDistinctData
} = require("../models/common");

var transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    // secure: true,
    auth: {
        user: "mohdfaraz.ctinfotech@gmail.com",
        pass: "lpwbmjbdfiynjnif",
    },
});

const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve(__dirname + "/view/"),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname + "/view/"),
};

transporter.use("compile", hbs(handlebarOptions));

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

exports.getAllBible = async (req, res, next) => {
    try {

        const result = await getData("kjvbible", '');


        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Unable to get the data",
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

exports.getBibleVersesByVerse = async (req, res, next) => {
    try {
        const { table_name, verse } = req.body;


        if (verse.includes(':') && !verse.includes('-')) {

            const regex = /(\d+\s\w+(?:\s\w+)*)\s(\d+):(\d+)/;
            const match = verse.match(regex);

            if (match) {
                // Extract the parts of the match
                const part1 = match[1];
                const part2 = match[2];
                const part3 = match[3];

                var result = await getData(table_name, `where book_name = '${part1}' and chapter = ${part2} and verse_number = ${part3}`);
            } else {
                const wordsArray = verse.split(" ");
                const bookName = wordsArray[0];
                const chapterArray = wordsArray[1].split(":");

                var result = await getData(table_name, `where book_name = '${bookName}' and chapter = ${chapterArray[0]} and verse_number = ${chapterArray[1]}`);

            }
        } else if (verse.includes(':') && verse.includes('-')) {
            const regex = /^(\d+\s\w+(?:\s\w+)*)\s(\d+):(\d+)-(\d+)$/;
            const match = verse.match(regex);

            if (match) {
                // Extract the parts of the match
                const part1 = match[1]; // e.g., "1 Samule"
                const part2 = match[2]; // e.g., "3"
                const part3 = match[3]; // e.g., "5"
                const part4 = match[4]; // e.g., "10"


                var result = await getData(table_name, `where book_name = '${part1}' and chapter = ${part2} and verse_number BETWEEN ${part3} AND ${part4}`);
            } else {
                const wordsArray = verse.split(" ");
                const bookName = wordsArray[0];
                const chapterArray = wordsArray[1].split(":");
                const searchverse = chapterArray[1].split("-");

                var result = await getData(table_name, `where book_name = '${bookName}' and chapter = ${chapterArray[0]} and verse_number BETWEEN ${searchverse[0]} AND ${searchverse[1]}`);

            }
        }
        else {
            var result = await getData(table_name, `where  verse  LIKE '%${verse}%'`);
        }

        if (result.length === 0) {
            // User not found
            return res.json({
                success: false,
                message: "Data not found"
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
exports.savedSearchesKeyword = async (req, res, next) => {
    try {
        const { verse } = req.body;
        const user_id = req.user_id;

        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                verse: [Joi.string().empty().required()]
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

                verse_number: verse,
                user_id: user_id

            };
            const result = await insertData('saved_searches', user, '');
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
        const { verse_number, verse, notes, bg_image } = req.body;
        const user_id = req.user_id;


        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                verse_number: [Joi.string().empty().required()],
                verse: [Joi.string().empty().required()],
                bg_image: [Joi.string().empty().required()],
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
                user_id: user_id,
                bg_image: bg_image

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

        const getRandonResult = await getData('random_verse', `WHERE DATE(created_at) = CURRENT_DATE`);

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
                data: generateRandom[0]
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
exports.sendEmail = async (req, res, next) => {
    try {
        const { html, to, table_name } = req.body;
        const userName = req.userName;
        console.log("userName",userName);
        console.log("userName",html);
        const emailArray = to.split(',').map(email => email.trim());
      if(table_name =='saved'){
        const decodedHtml = JSON.parse(html);
        if (to.length > 0) {
            for (const emails of emailArray) {
                console.log("emails=========>>>>>>>>>>", emails);
                let mailOptions = {
                    from: "mohdfaraz.ctinfotech@gmail.com",
                    to: emails,
                    subject: "Verse of the day",
                    template: "verse_of_the_day",
                    context: {
                        msg: decodedHtml[0],
                        name:userName
                    }
  
                };
                transporter.sendMail(mailOptions, async function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.json({
                            success: false,
                            status: 400,
                            message: "Mail Not delivered",
                        });
                    } else {
                        // return res.json({
                        //     success: true,
                        //     message: "Mail send successfully",
                        //     status: 200,
                        // });
                    }
                });
  
            }
        }
    }else if(table_name =='edited'){
        const decodedHtml = decodeURIComponent(html);
        if (to.length > 0) {
            for (const emails of emailArray) {
                console.log("emails=========>>>>>>>>>>", emails);
                let mailOptions = {
                    from: "mohdfaraz.ctinfotech@gmail.com",
                    to: emails,
                    subject: "Verse of the day",
                    template: "verseMail",
                    context: {
                        msg: decodedHtml,
                        name:userName
                    }
  
                };
                transporter.sendMail(mailOptions, async function (error, info) {
                    if (error) {
                        console.log(error);
                        return res.json({
                            success: false,
                            status: 400,
                            message: "Mail Not delivered",
                        });
                    } else {
                        // return res.json({
                        //     success: true,
                        //     message: "Mail send successfully",
                        //     status: 200,
                        // });
                    }
                });
  
            }
        }
    }else{
            const decodedHtml = decodeURIComponent(html);
            if (to.length > 0) {
                for (const emails of emailArray) {
                    console.log("emails=========>>>>>>>>>>", emails);
                    let mailOptions = {
                        from: "mohdfaraz.ctinfotech@gmail.com",
                        to: emails,
                        subject: "Verse of the day",
                        template: "verseMail",
                        context: {
                            msg: decodedHtml,
                        }
      
                    };
                    transporter.sendMail(mailOptions, async function (error, info) {
                        if (error) {
                            console.log(error);
                            return res.json({
                                success: false,
                                status: 400,
                                message: "Mail Not delivered",
                            });
                        } else {
                            // return res.json({
                            //     success: true,
                            //     message: "Mail send successfully",
                            //     status: 200,
                            // });
                        }
                    });
      
                }
            }

        }
        


        return res.status(200).json({
            success: true,
            message: "Mail send successfully",

        });

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

exports.getSavedSearchesKeys = async (req, res, next) => {
    try {
        const user_id = req.user_id;
        const getRandonResult = await getDistinctData('DISTINCT verse_number From saved_searches', `WHERE user_id = ${user_id}`);
        // SELECT DISTINCT verse_number FROM saved_searches WHERE user_id = '82';
        if (getRandonResult.length > 0) {

            return res.json({
                success: true,
                message: "found successfully",
                data: getRandonResult
            });
        } else {
            // User found
            return res.status(200).json({
                success: false,
                message: "Data not found",
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



        const result = await getData(table_name, `where  verse  LIKE '%${keyword}%'`);
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

        const result = await getBookName(table_name);

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

        const result = await getChaptersNo(table_name, book_name);

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
exports.getshortURl = async (req, res, next) => {
    try {
        const { full_url, id } = req.body;
        // const shortUrl = new ShortUniqueId({ length: 10 });
        let shortUrl = crypto.createHash('md5').update(full_url).digest("hex")

        const updated_info = {
            full_url: full_url,
            short_url: shortUrl

        };
        const result = await updateData('random_verse', updated_info, `where id = ${id}`);

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
                data: shortUrl,
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
exports.getEditshortURl = async (req, res, next) => {
    try {
        const { full_url } = req.body;
        // const shortUrl = new ShortUniqueId({ length: 10 });
        let shortUrl = crypto.createHash('md5').update(full_url).digest("hex")

        const checkShortUrl = await getData('editedurl', `where short_url = '${shortUrl}'`);
        if (checkShortUrl.length > 0) {
            return res.json({
                success: true,
                message: "Data not found",
                data: shortUrl,
            });
        } else {
            const updated_info = {
                full_url: full_url,
                short_url: shortUrl

            };
            const result = await insertData('editedurl', updated_info, '');

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
                    data: shortUrl,
                });
            }
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
exports.getFullURl = async (req, res, next) => {
    try {
        const { short_url } = req.body;

        const result = await getUnionData(short_url);

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
exports.getEditFullURl = async (req, res, next) => {
    try {
        const { short_url } = req.body;

        const result = await getData('editedurl', `where short_url = '${short_url}'`);

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


        let filename = "";
        if (req.file) {
            const file = req.file;
            filename = file.filename;
        }

        const data = {
            image: filename
        };


        const result = await insertData('card_template', data, '');
        if (result.affectedRows) {
            return res.json({
                message: "Card template uploaded successfully",
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
            // const user_id = req.user_id;
            let filename = "";
            if (req.file) {
                const file = req.file;
                filename = file.filename;
            }
            // const userInfo = await fetchUserBy_Id(user_id);

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

exports.updateBanners = async (req, res, next) => {
    try {

        const { sidebar_link, small_link, big_link } = req.body;

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
            big_image: big_image ? big_image : getMisc[0]?.big_image,
            sidebar_link: sidebar_link,
            small_link: small_link,
            big_link: big_link
        };
        const updateHome = await updateData('banners', updated_info, 'where id = 1');

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

exports.getUsers = async (req, res, next) => {
    try {

        const result = await getData('users', '');

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



exports.sendVerseMail = async (req, res) => {
    try {

        const users = await getData('users', '');

        const getRandonResult = await getData('random_verse', `WHERE DATE(created_at) = CURRENT_DATE`);
        console.log("users", getRandonResult);
        if (users.length == 0) {

        }
        for (const items of users) {
            let mailOptions = {
                from: "mohdfaraz.ctinfotech@gmail.com",
                to: items.email,
                subject: "Verse of the day",
                template: "verse_of_the_day",
                context: {
                    msg: getRandonResult[0]
                },
            };
            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    return res.json({
                        success: false,
                        status: 400,
                        message: "Mail Not delivered",
                    });
                } else {


                }
            });

        }

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500,
            error: error,
        });
    }
};



exports.deleteVerses = async (req, res, next) => {
    try {
        const { ids, table_name } = req.body;
        if (table_name == 'edited') {
            var deleteVerse = await deleteData('edited_verse', `WHERE id IN (${ids})`);

        } else if (table_name == 'saved') {
            var deleteVerse = await deleteData('saved_verses', `WHERE id IN (${ids})`);
        }else if(table_name =='freinds'){
            var deleteVerse = await deleteData('friends_list', `WHERE id IN (${ids})`);
        }

        if (deleteVerse.affectedRows > 0) {
            // User not found
            return res.json({
                success: true,
                message: "Deleted Successfully",
            });
        } else {
            // User found
            return res.status(200).json({
                success: false,
                message: "failed to delete"
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

exports.deleteTempalte = async (req, res, next) => {
    try {
        const { ids } = req.body;
      
            var deleteVerse = await deleteData('card_template', `WHERE id IN (${ids})`);
        

        if (deleteVerse.affectedRows > 0) {
            // User not found
            return res.json({
                success: true,
                message: "Deleted Successfully",
            });
        } else {
            // User found
            return res.status(200).json({
                success: false,
                message: "failed to delete"
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






