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
        const { table_name, verse_no } = req.body;

        const result = await getData(table_name, `where verse_number = '${verse_no}'`);
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
        const {  verse_number, verse, notes} = req.body;


        const schema = Joi.alternatives(
            Joi.object({
                // version: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                verse_number: [Joi.string().empty().required()],
                verse: [Joi.string().empty().required()],
                notes: Joi.string().optional(),

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
                notes:notes

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


exports.getBibleVerseOfTheDay = async (req, res, next) => {
    try {
        
        const getRandonResult = await getData('random_verse', `where created_at = CURRENT_DATE`);
        console.log("getRandonResult", getRandonResult);
        
        if (getRandonResult.length === 0) {
            const generateRandom = await getData('kjv_bible', `order by rand() limit 1`);
            console.log(generateRandom);
            const random = {
                verse_number : generateRandom[0].verse_number,
                verse:generateRandom[0].verse
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
                message: "found successfully",
                data: getRandonResult[0],
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
}