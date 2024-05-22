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
  registerUser,
  phone_no_check, delete_text, fetch_text, add_text, update_notification_status, update_chat_notification_status, update_video_call_notification_status, update_group_notification_status,
  get_all_users, Allnotification, update_incognito_status, Allnotificationbyuser_id, update_tapes_notification_status,
  my_all_favorite_user, Get_user_info, get_block_user_status, deleteNotification,
  delete_User, addnotification, update_dont_disturb_status,
  updateUserBy_ActToken, get_profile_vist,
  fetchUserByToken, all_Users,
  username_Check, filter, insert_report,
  updatePassword_1, Get_new_users,
  updatePassword,
  fetchUserByPhone_number_and_otp,
  fetchUserByPhone_number,
  updatePassword_2,
  fetchUserByemail_and_otp,
  fetchUserByEmail,
  updateUser,
  check_favorites_User,
  update_otp_by_phone_number,
  updateToken,
  update_otp_by_email,
  phone_Check,
  offline_Status,
  fetchUserByActToken,
  updateUserByActToken,
  fetchUserById,
  insert_Links,
  fetchUserBy_Id,
  verify_otp,
  updateUserById,
  verify_status,
  Online_Status, profile_vist, getAllprofileVist,
  add_favorite_user,
  fetchUserByIdtoken,
  deleteFavUser,
  Addalbums, fcmToken_phone,
  MyAlbums, fetch_fcm, Allsubscription,
  uploadAlbums, update_notification,
  albumsPhotos, check_notification,
  myAlbumbyId, fcmToken,
  updateAlbum, appVerification, addShowme, updateShowme, appVerificationImage, updateReqnotification,
  insertAlbumShare, addProfileimages, profileimages, deleteProfileimages, fetchUserByphoneEmail,
  MyAlbumsharing, update_viewed_profile, checkViewedProfile, insertgroup, inserttags, groupChat, updateUserByIdcompletet,
  getUser_by_id, block_unblock, insert_block_unblock, get_block_user, get_block_list, shared_to_count, Get_nearby_users, notificationVisi, fetchVisitsInPast24Hours,
  markNotificationAsSeen,
  fetchRandomData,
  markAllNotificationAsSeen } = require("../models/users");
const {
  insertData,
  updateData,
  getData,
  deleteData,
  fetchCount,
  getSelectedColumn,
  filtertags,
} = require("../models/common");
const { Console } = require("console");

const baseurl = config.base_url;
const Fcm_serverKey = config.fcm_serverKey;
const googledistance_key = config.googledistance_key;



function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}
// Function to convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function distanceShow(units, origins, destinations) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=${units}&origins=${origins}&destinations=${destinations}&key=${googledistance_key}`;
    // console.log("apiUrlapiUrlapiUrlapiUrlapiUrlapiUrl",apiUrl)
    axios.get(apiUrl)
      .then(response => {
        // Handle the response here
        // const distance = response.data.rows[0]?.elements[0]?.distance.text;
        // resolve(distance);
        const distanceObj = response.data.rows[0]?.elements[0];
        console.log(distanceObj)
        if (distanceObj.distance) {
          console.log("distanceObj", distanceObj)
          const distanceValue = distanceObj.distance.value;
          console.log("distanceValue", distanceValue)

          const distance = distanceObj.distance.text;

          resolve({ distance, distanceValue });

        } else {
          resolve("No distance information available");
        }
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
        reject(error);
      });
  });
}



function calculateAge(dateString) {
  const [day, month, year] = dateString.split('/').map(Number);

  // Create a Date object using the parsed values
  const birthDate = new Date(year, month - 1, day);

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in years
  const age = currentDate.getFullYear() - birthDate.getFullYear();

  // Check if the birthday has already occurred this year
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    // If not, subtract 1 from the age
    return age - 1;
  }

  return age;
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const saltRounds = 10;

const complexityOptions = {
  min: 8,
  max: 250,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
};

function generateToken() {
  var length = 6,
    charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function generateOTP(length = 8) {
  const chars = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    OTP += chars.charAt(randomIndex);
  }

  return OTP;
}


async function checkSubscriptionDetail(user_id) {
  try {
    const currentDate = moment();
    let start_date = currentDate.format('YYYY-MM-DD')
    const subscriptionStatus = await ChecksubscriptionDates(user_id);
    const Freesubscription = await Allsubscription(0);

    if (subscriptionStatus.length > 0) {
      if (start_date == subscriptionStatus[0].expired_at) {
        return 1;
      } else {
        return subscriptionStatus[0];
      }
    } else {
      return Freesubscription[0];
    }

  } catch (error) {
    console.error("Error:", error);
    return 2;
  }
}


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

exports.signUp = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const act_token = generateRandomString(8);
    const schema = Joi.alternatives(
      Joi.object({
        email: [
          Joi.string()
            .min(5)
            .max(255)
            .email({ tlds: { allow: false } })
            .lowercase()
            .required(),
        ],
        // password: passwordComplexity(complexityOptions),
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
        }),
        first_name: Joi.string().required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
        }),
        last_name: Joi.string().required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
        }),

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmail(email);

      if (data.length !== 0) {
        return res.json({
          success: false,
          message:
            "Already have account with this " + email + " email , Please Login",
          status: 400,
        });
      }
      else {
        var otp = generateOTP();
        if (!result.error) {
          let mailOptions = {
            from: "mohdfaraz.ctinfotech@gmail.com",
            to: email,
            subject: "Activate Account",
            template: "signupemail",
            context: {
              href_url: baseurl + `/verifyUser/` + `${act_token}`,
              image_logo: baseurl + `/image/logo.png`,
              msg: `Please click below link to activate your account.`
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
              const hash = await bcrypt.hash(password, saltRounds);
              const user = {
                email: email,
                password: hash,
                first_name: first_name,
                last_name: last_name,
                act_token: act_token,

              };

              const create_user = await registerUser(user);
              return res.json({
                success: true,
                message:
                  "A verification link has been sent to your email . please confirm your account by click on the link " +
                  `${email}`,
                status: 200,
              });

            }
          });
        } else {
          return res.json({
            message: "user add failed",
            status: 400,
            success: false,
          });
        }
      }
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

exports.verifyUser = async (req, res) => {
  try {
    const { token, act_token } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        token: Joi.string().empty().required().messages({
          "string.required": "token is required",
        }),
        act_token: Joi.string().empty().required().messages({
          "string.required": "act_token is required",
        }),
      })
    );
    const result = schema.validate({ token, act_token });
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByActToken(act_token);
      if (data.length !== 0) {
        let datas = {
          act_token: "",
          status: true,
        };

        const result = await updateUserByActToken(
          token,
          datas.act_token,
          data[0]?.id
        );

        return res.json({
          success: true,
          message: "Email verified successfully! You can now log in.",
          status: 200,
        });

      } else {
        return res.json({
          success: false,
          message: "Error verifying email.",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
    });
  }
};

exports.verifyUserEmail = async (req, res) => {
  try {
    const act_token = req.params.id;
    const token = generateToken();
    if (!act_token) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByActToken(act_token);
      if (data.length !== 0) {
        let datas = {
          act_token: "",
          status: true,
        };
        const hash = await bcrypt.hash(token, saltRounds);
        const result = await updateUserByActToken(
          hash,
          datas.act_token,
          data[0]?.id
        );
        console.log("result verfify user", result);


        if (result.affectedRows) {
          res.sendFile(__dirname + "/view/verify.html");
        } else {
          res.sendFile(__dirname + "/view/notverify.html");
        }
      } else {
        res.sendFile(__dirname + "/view/notverify.html");
      }
    }
  } catch (error) {
    console.log(error);
    res.send(`<div class="container">
        <p>404 Error, Page Not Found</p>
        </div> `);
  }
};

// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password, fcm_token } = req.body;
//     const token = generateToken();
//     const schema = Joi.alternatives(
//       Joi.object({
//         email: [Joi.string().empty().required()],
//         fcm_token: [Joi.string().empty().required()],
//         password: Joi.string().min(8).max(15).required().messages({
//           "any.required": "{{#label}} is required!!",
//           "string.empty": "can't be empty!!",
//           "string.min": "minimum 8 value required",
//           "string.max": "maximum 15 values allowed",
//         }),
//       })
//     );
//     const result = schema.validate({ email, password, fcm_token });

//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 400,
//         success: false,
//       });
//     } else {
//       const data = await fetchUserByEmail(email);
//       if (data.length !== 0) {
//         if (data[0]?.act_token === "" && data[0]?.verify_user === 1) {
//           if (email === data[0].email) {
//             const match = bcrypt.compareSync(password, data[0]?.password);
//             if (match) {
//               const toke = jwt.sign(
//                 {
//                   data: {
//                     id: data[0].id,
//                   },
//                 },
//                 "SecretKey"
//                 // { expiresIn: "1d" }
//               );
//               bcrypt.genSalt(saltRounds, async function (err, salt) {
//                 bcrypt.hash(token, salt, async function (err, hash) {
//                   if (err) throw err;
//                   const results = await updateToken(hash, email);
//                   const upload_fcm_token = await fcmToken(email, fcm_token);
//                   const data1 = await fetchUserByEmail(email);
//                   return res.json({
//                     status: 200,
//                     success: true,
//                     message: "Login successful!",
//                     token: toke,
//                     user_info: data1[0],
//                   });
//                 });
//               });
//             } else {
//               return res.json({
//                 success: false,
//                 message: "Invalid password.",
//                 status: 400,
//               });
//             }
//           } else {
//             return res.json({
//               message: "Account not found. Please check your details",
//               status: 400,
//               success: false,
//             });
//           }
//         } else {
//           return res.json({
//             message: "Login failed. Please verify your account and try again",
//             status: 400,
//             success: false,
//           });
//         }
//       } else {
//         return res.json({
//           success: false,
//           message: "Account not found. Please check your details.",
//           status: 400,
//         });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "An internal server error occurred. Please try again later.",
//       status: 500,
//       error: error,
//     });
//   }
// };
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = generateToken();
    const schema = Joi.alternatives(
      Joi.object({
        email: [Joi.string().empty().required()],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),

      })
    );
    const result = schema.validate({ email, password });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmail(email);
      if (data.length !== 0) {
        if (data[0]?.act_token === "" && data[0]?.access_level === 1) {
          if (email === data[0].email) {
            const match = bcrypt.compareSync(password, data[0]?.password);
            if (match) {
              const toke = jwt.sign(
                {
                  data: {
                    id: data[0].id,
                  },
                },
                "SecretKey"
                // { expiresIn: "1d" }
              );
              bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(token, salt, async function (err, hash) {
                  if (err) throw err;
                  const results = await updateToken(hash, email);

                  return res.json({
                    status: 200,
                    success: true,
                    message: "Login successful!",
                    token: toke,
                    user_info: data[0],
                  });
                });
              });
            } else {
              return res.json({
                success: false,
                message: "Invalid password.",
                status: 400,
              });
            }
          } else {
            return res.json({
              message: "Account not found. Please check your details",
              status: 400,
              success: false,
            });
          }
        } else {
          return res.json({
            message: "Login failed. Please verify your account and try again",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Account not found. Please check your details.",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = generateToken();
    const schema = Joi.alternatives(
      Joi.object({
        email: [Joi.string().empty().required()],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),

      })
    );
    const result = schema.validate({ email, password });

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await getData('admin',`where email = ${email}`);
      if (data.length !== 0) {
        if (data[0]?.act_token === "" && data[0]?.access_level === 1) {
          if (email === data[0].email) {
            const match = bcrypt.compareSync(password, data[0]?.password);
            if (match) {
              const toke = jwt.sign(
                {
                  data: {
                    id: data[0].id,
                  },
                },
                "SecretKey"
                // { expiresIn: "1d" }
              );
              bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(token, salt, async function (err, hash) {
                  if (err) throw err;
                  const results = await updateAdminToken(hash, email);

                  return res.json({
                    status: 200,
                    success: true,
                    message: "Login successful!",
                    token: toke,
                    user_info: data[0],
                  });
                });
              });
            } else {
              return res.json({
                success: false,
                message: "Invalid password.",
                status: 400,
              });
            }
          } else {
            return res.json({
              message: "Account not found. Please check your details",
              status: 400,
              success: false,
            });
          }
        } else {
          return res.json({
            message: "Login failed. Please verify your account and try again",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Account not found. Please check your details.",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};


exports.social_login = async (req, res) => {
  try {
    const { email, social_id, name, fcm_token } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        email: [
          Joi.string()
            .min(5)
            .max(255)
            .email({ tlds: { allow: false } })
            .lowercase()
            .required(),
        ],
        social_id: [Joi.string().empty().required()],
        name: [Joi.string().empty().required()],
        fcm_token: [Joi.string().empty().required()],

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmail(email);

      if (data.length !== 0) {

        const toke = jwt.sign(
          {
            data: {
              id: data[0].id,
            },
          },
          "SecretKey"
          // { expiresIn: "1d" }
        );

        return res.json({
          success: true,
          message: " login successfully ",
          status: 200,
          Jwt_token: toke,
          user_info: data[0]
        });
      } else {

        const user = {
          email: email,
          social_id: social_id,
          name: name,
          social_login: 1,
          verify_user: 1,
          fcm_token: fcm_token,
          username: generateRandomString(8),
        };
        const create_user = await registerUser(user);
        let setting = {
          explore: 1, distance: 1, view_me: 0, user_id: create_user.insertId
        }
        const caddShowme = addShowme(setting);
        const user_id = create_user.insertId;
        const toke = jwt.sign(
          {
            data: {
              id: user_id,
            },
          },
          "SecretKey"
          // { expiresIn: "1d" }
        );
        const data1 = await fetchUserByEmail(email);
        return res.json({
          success: true,
          message: " Successfully ",
          Jwt_token: toke,
          status: 200,
          user_info: data1[0]
        });
      }
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


// exports.loginUser_with_phone = async (req, res) => {
//   try {
//     const { phone_number, password, fcm_token } = req.body;
//     const token = generateToken();
//     const schema = Joi.alternatives(
//       Joi.object({
//         phone_number: [Joi.number().empty().required()],
//         fcm_token: [Joi.string().empty().required()],
//         password: Joi.string().min(8).max(15).required().messages({
//           "any.required": "{{#label}} is required!!",
//           "string.empty": "can't be empty!!",
//           "string.min": "minimum 8 value required",
//           "string.max": "maximum 15 values allowed",
//         }),
//       })
//     );
//     const result = schema.validate(req.body);

//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 400,
//         success: false,
//       });
//     } else {
//       const check_phone_number = await getData(
//         "users",
//         `where phone_number= ${phone_number}`
//       );
//       if (check_phone_number.length !== 0) {
//         if (
//           check_phone_number[0]?.act_token === "" &&
//           check_phone_number[0]?.verify_user === 1
//         ) {
//           if (phone_number === check_phone_number[0].phone_number) {
//             const match = bcrypt.compareSync(
//               password,
//               check_phone_number[0]?.password
//             );
//             if (match) {
//               const toke = jwt.sign(
//                 {
//                   data: {
//                     id: check_phone_number[0].id,
//                   },
//                 },
//                 "SecretKey",

//               );
//               bcrypt.genSalt(saltRounds, async function (err, salt) {
//                 bcrypt.hash(token, salt, async function (err, hash) {
//                   if (err) throw err;

//                   // const results = await updateData('users',`token= hash`, `where phone_number= ${phone_number}`)
//                   let data = `token = '${hash}'`;
//                   let where = `where phone_number = ${phone_number}`;
//                   const result1 = await updateData("users", where, data);
//                   const upload_fcm_token = await fcmToken_phone(phone_number, fcm_token);

//                   const check_phone_number1 = await getData(
//                     "users",
//                     `where phone_number= ${phone_number}`
//                   );

//                   return res.json({
//                     status: 200,
//                     success: true,
//                     message: "Login successful!",
//                     token: toke,
//                     user_info: check_phone_number1[0],
//                   });
//                 });
//               });
//             } else {
//               return res.json({
//                 success: false,
//                 message: "Invalid password.",
//                 status: 400,
//               });
//             }
//           } else {
//             return res.json({
//               message: "Account not found. Please check your details",
//               status: 400,
//               success: false,
//             });
//           }
//         } else {
//           return res.json({
//             message: "Login failed. Please verify your account and try again",
//             status: 400,
//             success: false,
//           });
//         }
//       } else {
//         return res.json({
//           success: false,
//           message: "Account not found. Please check your details.",
//           status: 400,
//         });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "An internal server error occurred. Please try again later.",
//       status: 500,
//       error: error,
//     });
//   }
// };
exports.loginUser_with_phone = async (req, res) => {
  try {
    const { phone_number, password, fcm_token, latitude, longitude } = req.body;
    const token = generateToken();
    const schema = Joi.alternatives(
      Joi.object({
        phone_number: [Joi.number().empty().required()],
        fcm_token: [Joi.string().empty().required()],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional()
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_phone_number = await getData(
        "users",
        `where phone_number= ${phone_number}`
      );
      if (check_phone_number.length !== 0) {
        if (
          check_phone_number[0]?.act_token === "" &&
          check_phone_number[0]?.verify_user === 1
        ) {
          if (phone_number === check_phone_number[0].phone_number) {
            const match = bcrypt.compareSync(
              password,
              check_phone_number[0]?.password
            );
            if (match) {
              const toke = jwt.sign(
                {
                  data: {
                    id: check_phone_number[0].id,
                  },
                },
                "SecretKey",

              );
              bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(token, salt, async function (err, hash) {
                  if (err) throw err;

                  // const results = await updateData('users',`token= hash`, `where phone_number= ${phone_number}`)
                  let data = `token = '${hash}'`;
                  let where = `where phone_number = ${phone_number}`;
                  const result1 = await updateData("users", where, data);
                  const upload_fcm_token = await fcmToken_phone(phone_number, fcm_token);

                  if (latitude && longitude) {
                    let data = ` latitude = '${latitude}' ,longitude = '${longitude}' `;
                    let where = `where phone_number = '${phone_number}'`;
                    const result1 = await updateData("users", where, data);
                  }

                  const check_phone_number1 = await getData(
                    "users",
                    `where phone_number= ${phone_number}`
                  );

                  return res.json({
                    status: 200,
                    success: true,
                    message: "Login successful!",
                    token: toke,
                    user_info: check_phone_number1[0],
                  });
                });
              });
            } else {
              return res.json({
                success: false,
                message: "Invalid password.",
                status: 400,
              });
            }
          } else {
            return res.json({
              message: "Account not found. Please check your details",
              status: 400,
              success: false,
            });
          }
        } else {
          return res.json({
            message: "Login failed. Please verify your account and try again",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Account not found. Please check your details.",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};
exports.resetPassword = async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const schema = Joi.alternatives(
      Joi.object({
        password: Joi.string().min(5).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 5 value required",
          "string.max": "maximum 10 values allowed",
        }),
        user_id: Joi.number().empty().required().messages({
          "number.empty": "id can't be empty",
          "number.required": "id  is required",
        }),
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const result = await fetchUserById(user_id);
      if (result.length != 0) {
        const hash = await bcrypt.hash(password, saltRounds);
        const result2 = await updateUserbyPass(hash, user_id);

        if (result2) {
          return res.json({
            success: true,
            status: 200,

            message:
              "Password reset successful. You can now log in with your new password",
          });
        } else {
          return res.json({
            success: false,
            status: 200,
            message: "Some error occured. Please try again",
          });
        }
      } else {
        return res.json({
          success: false,
          status: 200,
          message: "User Not Found",
        });
      }
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

function randomStringAsBase64Url(size) {
  return base64url(crypto.randomBytes(size));
}

exports.forgotPassword__by_email = async (req, res) => {
  try {
    const { email } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        email: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate({ email });
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmail(email);
      if (data.length !== 0) {
        const genToken = randomStringAsBase64Url(20);
        await updateUser(genToken, email);

        const result = await fetchUserByEmail(email);

        let token = result[0].token;
        var otp = generateOTP(4);
        const update_OTP = await update_otp_by_email(email, otp);
        if (!result.error) {
          let mailOptions = {
            from: "xderdating@gmail.com",
            to: req.body.email,
            subject: "Forget Password",
            template: "forget_template",
            context: {
              msg: `OTP ` + otp,
            },
          };
          transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
              return res.json({
                success: false,
                message: error,
              });
            } else {
              return res.json({
                success: true,

                message:
                  "Password reset link sent successfully. Please check your email " +
                  email,
                email: email,
              });
            }
          });
        }
      } else {
        return res.json({
          success: false,

          message: "Email address not found. Please enter a valid email",
          status: 400,
        });
      }
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

exports.forgotPassword_otp_match_phone_number = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        phone_number: [Joi.number().empty().required()],
        otp: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByPhone_number(phone_number);
      if (data.length !== 0) {
        const result = await fetchUserByPhone_number_and_otp(phone_number, otp);
        if (result.length != 0) {
          var OTP = 1;
          const update_OTP = await update_otp_by_phone_number(
            phone_number,
            OTP
          );

          return res.json({
            success: true,
            OTP: otp,
            message: " OTP match successfully",
          });
        } else {
          return res.json({
            success: true,
            message: " Invalid OTP ",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "phone_number not found. Please enter a valid phone_number",
          status: 400,
        });
      }
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

exports.forgotPassword_otp_match_email = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        email: [Joi.string().empty().required()],
        otp: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmail(email);
      if (data.length !== 0) {
        const result = await fetchUserByemail_and_otp(email, otp);
        if (result.length !== 0) {
          const update_OTP = await update_otp_by_email(email, otp);
          return res.json({
            success: true,
            message: " OTP match successfully",
          });
        } else {
          return res.json({
            success: true,
            message: " Invalid OTP ",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "phone_number not found. Please enter a valid phone_number",
          status: 400,
        });
      }
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

exports.forgotPassword_by_phone_number = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        phone_number: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate({ phone_number });
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByPhone_number(phone_number);
      if (data.length !== 0) {
        const result = await fetchUserByPhone_number(phone_number);

        var otp = generateOTP(4);
        const update_OTP = await update_otp_by_phone_number(phone_number, otp);

        return res.json({
          success: true,
          OTP: otp,
          message:
            "Password reset OTP sent successfully to your phone_number  " +
            phone_number,
          phone_number: phone_number,
        });
      } else {
        return res.json({
          success: false,

          message: "phone_number not found. Please enter a valid phone_number",
          status: 400,
        });
      }
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

exports.verifyPassword = async (req, res) => {
  try {
    const id = req.params.token;
    if (!id) {
      return res.status(400).send("Invalid link");
    } else {
      const result = await fetchUserByIdtoken(id);
      const token = result[0]?.token;
      if (result.length !== 0) {
        localStorage.setItem("vertoken", JSON.stringify(token));

        res.render(path.join(__dirname, "/view/", "forgetPassword.ejs"), {
          msg: "",
        });
      } else {
        res.render(path.join(__dirname, "/view/", "forgetPassword.ejs"), {
          msg: "This User is not Registered",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.send(`<div class="container">
          <p>404 Error, Page Not Found</p>
          </div> `);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    const token = JSON.parse(localStorage.getItem("vertoken"));
    const schema = Joi.alternatives(
      Joi.object({
        password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
        confirm_password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
      })
    );
    const result = schema.validate({ password, confirm_password });
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      res.render(path.join(__dirname + "/view/", "forgetPassword.ejs"), {
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        msg: message,
      });
    } else {
      if (password == confirm_password) {
        const data = await fetchUserByToken(token);

        if (data.length !== 0) {
          const update_show_password = await updatePassword_2(password, token);
          const hash = await bcrypt.hash(password, saltRounds);
          const result2 = await updatePassword(hash, token);

          if (result2) {
            res.sendFile(path.join(__dirname + "/view/message.html"), {
              msg: "",
            });
          } else {
            res.render(path.join(__dirname, "/view/", "forgetPassword.ejs"), {
              msg: "Internal Error Occured, Please contact Support.",
            });
          }
        } else {
          return res.json({
            message: "User not found please sign-up first",
            success: false,
            status: 400,
          });
        }
      } else {
        res.render(path.join(__dirname, "/view/", "forgetPassword.ejs"), {
          msg: "Password and Confirm Password do not match",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.render(path.join(__dirname, "/view/", "forgetPassword.ejs"), {
      msg: "Internal server error",
    });
  }
};

exports.myProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;

    const user_info = await getData("users", `where id= ${user_id}`);

    if (user_info != 0) {
      await Promise.all(
        user_info.map(async (item) => {

          const profileimage = await profileimages(user_id);

          if (item.profile_image != "No image") {
            // item.profile_image = baseurl + "/profile/" + item.profile_image;
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          }

          if (profileimage?.length > 0) {
            item.images = profileimage.map(imageObj => imageObj.image ? { 'path': baseurl + '/profile/' + imageObj.image } : "");
          } else {
            item.images = [];
          }

        })
      );

      return res.json({
        status: 200,
        success: true,
        message: "User Found Successfull",
        user_info: user_info,
      });
    } else {
      return res.json({
        status: 400,
        success: false,
        message: "User Not Found",
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

exports.user_info = async (req, res) => {
  try {
    const { user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_info = await getData("users", `where id= ${user_id}`);

      if (user_info != 0) {
        await Promise.all(
          user_info.map(async (item) => {
            if (item.profile_image != "No image") {
              // item.profile_image = baseurl + "/profile/" + item.profile_image;
              item.profile_image = baseurl + "/profile/" + item.profile_image;
            }
          })
        );

        return res.json({
          status: 200,
          success: true,
          message: "User Found Successfull",
          user_info: user_info,
        });
      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.complete_Profile = async (req, res) => {
  try {
    const {
      name,
      username,
      DOB,
      about,
      country,
      city,
      tags,
      height,
      weight,
      ethnicity,
      body_type,
      relationship_status,
      looking_for,
      meet_at,
      sex,
      pronouns,
      covid_19,
      twitter,
      instagram,
      facebook,
      complete_profile_status,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        username: [Joi.string().empty().required()],//
        DOB: [Joi.string().empty().required()],//
        about: [Joi.string().empty().required()],//
        country: [Joi.string().empty().required()],//
        city: [Joi.string().empty().required()],//
        tags: [Joi.string().empty().required()],//
        height: [Joi.optional().allow("")],
        weight: [Joi.optional().allow("")],
        ethnicity: [Joi.optional().allow("")],
        body_type: [Joi.optional().allow("")],
        // tribes: [Joi.string().empty().required()],
        relationship_status: [Joi.optional().allow("")],
        looking_for: [Joi.string().empty().required()],//
        meet_at: [Joi.string().empty().required()],//
        sex: [Joi.optional().allow("")],
        pronouns: [Joi.optional().allow("")],
        covid_19: [Joi.optional().allow("")],
        twitter: [Joi.optional().allow("")],
        instagram: [Joi.optional().allow("")],
        facebook: [Joi.optional().allow("")],
        complete_profile_status: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
      }
      const userInfo = await fetchUserBy_Id(user_id);
      if (userInfo.length !== 0) {
        const usernmae_check = await username_Check(username, user_id);
        if (usernmae_check != 0) {
          return res.json({
            success: false,
            message:
              "Usernmae is already taken. Please use a different username.",
            status: 400,
          });
        }

        const birthdate = DOB;
        const age = calculateAge(birthdate);

        let user = {
          name: name,
          profile_image: filename,
          username: username,
          DOB: DOB,
          about: about,
          country: country,
          city: city,
          tags: tags,
          age: age,
          height: height ? height : 0,
          weight: weight ? weight : 0,
          ethnicity: ethnicity ? ethnicity : "",
          body_type: body_type ? body_type : "",
          // tribes: tribes,
          relationship_status: relationship_status ? relationship_status : "",
          looking_for: looking_for ? looking_for : "",
          meet_at: meet_at ? meet_at : "",
          sex: sex ? sex : "",
          pronouns: pronouns ? pronouns : "",
          covid_19: covid_19 ? covid_19 : "",
          twitter_link: twitter ? twitter : "",
          instagram_link: instagram ? instagram : "",
          facebook_link: facebook ? facebook : "",
          complete_profile_status: complete_profile_status,
        };
        const result = await updateUserByIdcompletet(user, user_id);
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

exports.editProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      DOB,
      about,
      country,
      city,
      tags,
      height,
      weight,
      ethnicity,
      body_type,
      // tribes,
      relationship_status,
      looking_for,
      meet_at,
      sex,
      pronouns,
      twitter,
      instagram,
      facebook,
      covid_19,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty()],
        username: [Joi.string().empty()],
        DOB: [Joi.string().empty()],
        about: [Joi.string().empty()],
        country: [Joi.string().empty()],
        city: [Joi.string().empty()],
        tags: [Joi.string().empty()],
        height: [Joi.number().empty()],
        weight: [Joi.number().empty()],
        ethnicity: [Joi.string().empty()],
        body_type: [Joi.string().empty()],

        // tribes: [Joi.string().empty()],
        relationship_status: [Joi.string().empty()],
        looking_for: [Joi.string().empty()],
        meet_at: [Joi.string().empty()],
        sex: [Joi.string().empty()],
        pronouns: [Joi.string().empty()],
        twitter: [Joi.string().allow(null, "").optional(),],
        instagram: [Joi.string().allow(null, "").optional(),],
        facebook: [Joi.string().allow(null, "").optional(),],
        covid_19: [Joi.string().empty()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
      }
      const userInfo = await fetchUserBy_Id(user_id);
      if (userInfo.length !== 0) {
        const usernmae_check = await username_Check(username, user_id);
        if (usernmae_check != 0) {
          return res.json({
            success: false,
            message:
              "Usernmae is already taken. Please use a different username.",
            status: 400,
          });
        }
        let get_age = '';
        if (DOB) {
          const birthdate = DOB;
          get_age = calculateAge(birthdate);
        } else {
          get_age = "";
        }
        let user = {
          name: name ? name : userInfo[0].name,
          profile_image: filename ? filename : userInfo[0].profile_image,
          username: username ? username : userInfo[0].username,
          DOB: DOB ? DOB : userInfo[0].DOB,
          about: about ? about : userInfo[0].about,
          country: country ? country : userInfo[0].country,
          city: city ? city : userInfo[0].city,
          tags: tags ? tags : userInfo[0].tags,
          height: height ? height : userInfo[0].height,
          weight: weight ? weight : userInfo[0].weight,
          ethnicity: ethnicity ? ethnicity : userInfo[0].ethnicity,
          body_type: body_type ? body_type : userInfo[0].body_type,
          //tribes: tribes ? tribes : userInfo[0].tribes,
          relationship_status: relationship_status
            ? relationship_status
            : userInfo[0].relationship_status,
          looking_for: looking_for ? looking_for : userInfo[0].looking_for,
          meet_at: meet_at ? meet_at : userInfo[0].meet_at,
          sex: sex ? sex : userInfo[0].sex,
          pronouns: pronouns ? pronouns : userInfo[0].pronouns,
          covid_19: covid_19 ? covid_19 : userInfo[0].covid_19,
          twitter_link: twitter ? twitter : userInfo[0].twitter_link != null ? userInfo[0].twitter_link : "",
          instagram_link: instagram ? instagram : userInfo[0].instagram_link != null ? userInfo[0].instagram_link : "",
          facebook_link: facebook ? facebook : userInfo[0].facebook_link != null ? userInfo[0].facebook_link : "",
          age: get_age ? get_age : 0
        };
        console.log(user);
        const result = await updateUserById(user, user_id);
        if (result.affectedRows) {
          return res.json({
            message: "update user successfully",
            status: 200,
            success: true,
          });
        } else {
          return res.json({
            message: "update user failed ",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          messgae: "data not found",
          status: 400,
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

exports.get_all_users_1 = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    var profile_length = "";
    let checksub = await checkSubscriptionDetail(user_id);

    if (checksub) {
      profile_length = checksub.home_profile;
    } else {
      profile_length = "";
    }

    const all_users = await all_Users();

    await Promise.all(
      all_users.map(async (item) => {
        if (item.profile_image != "No image") {
          // item.profile_image = baseurl + "/profile/" + item.profile_image;
          item.profile_image = baseurl + "/profile/" + item.profile_image;
        }
        const profileimage = await profileimages(item.id);


        if (profileimage?.length > 0) {
          item.images = profileimage.map(imageObj => imageObj.image ? baseurl + '/profile/' + imageObj.image : "");
        } else {
          item.images = [];
        }

        const favorite_user_id = item.id;
        const check_favoritesUser = await check_favorites_User(
          user_id,
          favorite_user_id
        );

        if (check_favoritesUser[0].count != 0) {
          item.favorites_user = "Y";
        } else {
          item.favorites_user = "N";
        }
        item.select = false;
        item.admin = false;
      })
    );

    if (all_users.length != 0) {
      const viewd_count = await get_profile_vist(user_id);
      const checkViewed = await checkViewedProfile(user_id);

      return res.json({
        message: "all users ",
        status: 200,
        success: true,
        all_users: all_users,
        profile_length: profile_length,
        viewed_count: viewd_count ? viewd_count.length : 0,
        checkViewed: checkViewed ? checkViewed[0].count_profile : 0

      });
    } else {
      return res.json({
        message: "No data found ",
        status: 400,
        success: false,
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



exports.get_all_users = async (req, res) => {
  try {
    const { age1, age2, search, body_type, relationship_status,
      looking_for, meet_at, height_1, height_2,
      weight_1, weight_2, online, app_verify, has_photo, has_album } = req.body;
    const schema = Joi.alternatives(
      Joi.object({

        age1: [Joi.number().allow(null, "").optional(),],
        age2: [Joi.number().allow(null, "").optional(),],
        body_type: [Joi.string().allow(null, "").optional(),],
        relationship_status: [Joi.string().allow(null, "").optional(),],
        looking_for: [Joi.string().allow(null, "").optional(),],
        meet_at: [Joi.string().allow(null, "").optional(),],
        height_1: [Joi.number().allow(null, "").optional(),],
        height_2: [Joi.number().allow(null, "").optional(),],
        weight_1: [Joi.number().allow(null, "").optional(),],
        weight_2: [Joi.number().allow(null, "").optional(),],
        search: [Joi.string().allow(null, "").optional(),],
        online: [Joi.string().allow(null, "").optional(),],
        app_verify: [Joi.string().allow(null, "").optional(),],
        has_photo: [Joi.string().allow(null, "").optional()],
        has_album: [Joi.string().allow(null, "").optional()],

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let array = [];
      var profile_length = "";
      let checksub = await checkSubscriptionDetail(user_id);
      const check_user = await getData("users", `where id= ${user_id}`);
      if (checksub) {
        profile_length = checksub.home_profile;
      } else {
        profile_length = "";
      }
      let all_users = await filter(age1, age2, search, user_id, body_type, relationship_status, looking_for, meet_at, height_1, height_2,
        weight_1, weight_2, online, app_verify, has_photo);

      const settingshow_me = await getData("setting_show_me", `where user_id= ${user_id}`);

      await Promise.all(
        all_users.map(async (item) => {
          const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
          item.explore_status = (settingshow_me[0]?.explore == 1) ? true : false
          item.distance_status = (settingshow_me[0]?.distance == 1) ? true : false

          if (item.latitude != null && item.latitude != "" && item.latitude != undefined && item.longitude != null && item.longitude != "" && item.longitude != undefined) {
            const unit = 'metric';
            const origin = check_user[0]?.latitude + ',' + check_user[0]?.longitude;
            const destination = item.latitude + ',' + item.longitude;
            try {
              const disvalue = await distanceShow(unit, origin, destination);
              if (disvalue.distance) {
                item.distance = disvalue.distance;
              }
            } catch (error) {
              console.error('Error in yourAsyncFunction:', error);
              // Handle errors as needed
            }
          } else {
            item.distance = "0"
          }
          if (item.profile_image != "No image") {
            // item.profile_image = baseurl + "/profile/" + item.profile_image;
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          }
          const profileimage = await profileimages(item.id);

          if (profileimage?.length > 0) {
            item.images = profileimage.map(imageObj => imageObj.image ? baseurl + '/profile/' + imageObj.image : "");
          } else {
            item.images = [];
          }

          const favorite_user_id = item.id;
          const check_favoritesUser = await check_favorites_User(
            user_id,
            favorite_user_id
          );

          if (check_favoritesUser[0].count != 0) {
            item.favorites_user = "Y";
          } else {
            item.favorites_user = "N";
          }
          item.select = false;
          item.admin = false;
          item.album_id = 0;
          const My1Albums = await MyAlbums(item.id);
          if (My1Albums.length > 0) {
            item.album_id = My1Albums[0]?.id;
            if (has_album != undefined && has_album != "" && has_album != "0") {
              array.push(item);
            }
          }


        })
      );
      if (array.length > 0 && has_album != "" && has_album != undefined && has_album != "0") {
        all_users = array;
      } else if (has_album != "" && has_album != undefined && has_album != "0") {
        all_users = array;
      } else {
        all_users = all_users;
      }

      if (all_users.length != 0) {
        const viewd_count = await fetchVisitsInPast24Hours(user_id);
        const checkViewed = await checkViewedProfile(user_id);

        return res.json({
          message: "all users ",
          status: 200,
          success: true,
          total: all_users.length,
          all_users: all_users,
          profile_length: profile_length,
          viewed_count: viewd_count ? viewd_count.length : 0,
          checkViewed: checkViewed ? checkViewed[0].count_profile : 0,
          // distance_statusss: (settingshow_me[0]?.distance == 1) ? true:false

        });
      } else {
        return res.json({
          message: "No data found ",
          status: 400,
          success: false,
        });
      }

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

// exports.delete_user = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;

//     const token_1 = authHeader;
//     const token = token_1.replace("Bearer ", "");


//     const decoded = jwt.decode(token);
//     const user_id = decoded.data.id;

//     const Delete_user = await delete_User(user_id);


//     if (Delete_user.affectedRows > 0) {

//       return res.json({
//         message: "User deleted successfully!",
//         status: 200,
//         success: true,
//       });

//     } else {

//       return res.json({
//         message: "Something Went Wrong!",
//         status: 400,
//         success: false,
//       });
//     }

//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "Internal server error",
//       status: 500,
//       error: error,
//     });
//   }
// };


exports.Add_favorites = async (req, res) => {
  try {
    const { favorite_user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        favorite_user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      const check_favorite_user = await getData(
        "users",
        `where id= ${favorite_user_id}`
      );

      if (check_favorite_user.length != 0) {
        const check_favoritesUser = await getData(
          "favorite_users",
          `where  user_id = ${user_id} AND favorite_user_id = ${favorite_user_id}`
        );
        // const check_favoritesUser = await check_favorites_User(
        //   user_id,
        //   favorite_user_id
        // );
        if (check_favoritesUser.length == 0) {
          const favorite_user_info = {
            user_id: user_id,
            favorite_user_id: favorite_user_id,
          };

          const Add_favorite_user = await add_favorite_user(favorite_user_info);
          return res.json({
            message:
              check_favorite_user[0].username +
              " added successfuly to your favorite list ",
            success: true,
            is_favorite: 1,
            status: 200,
          });
        } else {
          const dislike = await deleteFavUser(user_id, favorite_user_id);

          return res.json({
            message:
              check_favorite_user[0].username + " remove to favorite list",
            success: false,
            is_favorite: 0,
            status: 200,
          });
        }
      } else {
        return res.json({
          message: "User not found",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.my_favorite_users_list = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;

    const check_user = await getData("users", `where id= ${user_id}`);
    let array = [];
    if (check_user.length != 0) {
      const my_favorite_users = await my_all_favorite_user(user_id);
      await Promise.all(
        my_favorite_users.map(async (item) => {
          let where = "";
          if (req.body.online_status == '1') {
            where = ` AND online_status = '1' AND incognito_mode = 0 `;
          }
          var user_info = await getData("users", `where id= ${item.favorite_user_id} ${where}`);

          if (user_info[0]?.latitude != null && user_info[0]?.latitude != "" && user_info[0]?.latitude != undefined && user_info[0]?.longitude != null && user_info[0]?.longitude != "" && user_info[0]?.longitude != undefined) {
            const unit = 'metric';
            const origin = check_user[0]?.latitude + ',' + check_user[0]?.longitude;
            const destination = user_info[0]?.latitude + '%2C' + user_info[0]?.longitude;
            try {
              const disvalue = await distanceShow(unit, origin, destination);
              if (disvalue.distance) {
                item.distance = disvalue.distance;
              }
              const settingshow_me = await getData("setting_show_me", `where user_id= ${item.favorite_user_id}`);
              user_info?.map(async (userinfo) => {
                userinfo.distance = disvalue;
                userinfo.distance_status = (settingshow_me[0]?.distance == 1) ? true : false
              });
            } catch (error) {
              item.distance = "0"
              console.error('Error in yourAsyncFunction:', error);
              // Handle errors as needed
            }
          } else {
            item.distance = "0"
          }

          user_info?.map(async (userinfo) => {
            if (userinfo.profile_image != "No image") {
              userinfo.profile_image = baseurl + "/profile/" + userinfo.profile_image;

            } else {
              userinfo.profile_image = "";
            }
            userinfo.admin = false
            userinfo.favorites_user = "Y"

            // if (userinfo.latitude != null && userinfo.latitude != "" && userinfo.longitude != null && userinfo.longitude != "") {
            //   const unit = 'metric';
            //   const origin = check_user[0]?.latitude+','+ check_user[0]?.longitude;
            //   const destination = userinfo.latitude+'%2C'+userinfo.longitude;
            //   try {
            //     const disvalue = await distanceShow(unit, origin, destination);
            //     userinfo.distance = disvalue;
            //   } catch (error) {
            //     userinfo.distance = "0"
            //     console.error('Error in yourAsyncFunction:', error);
            //     // Handle errors as needed
            //   }
            //   // const distance = calculateDistance(check_user[0]?.latitude, check_user[0]?.longitude, userinfo.latitude, userinfo.longitude);

            //   // if (distance.toFixed(2) != "NaN") {
            //   //   userinfo.distance = distance.toFixed(2)
            //   // } else {
            //   //   userinfo.distance = "0";
            //   // }
            // } else {
            //   userinfo.distance = "0"
            // }

          });

          item.favorite_user_info = user_info;
          item.select = false


          if (user_info.length > 0) {
            item.online_status = user_info[0].online_status;
            array.push(item);
          }
        })
      );
      return res.json({
        message: "successfull",
        success: true,
        status: 200,
        my_favorite_users: array,
      });
    } else {
      return res.json({
        message: "User not found ",
        success: false,
        status: 400,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.online_status = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    const check_user = await getData("users", `where id= ${user_id}`);

    if (check_user.length != 0) {
      const OnLine_Status = await Online_Status(user_id);
      return res.json({
        message: "You are Online",
        success: true,
        status: 200,
      });
    } else {
      return res.json({
        message: "User not found please sign-up first",
        success: false,
        status: 400,
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.offline_status = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    const check_user = await getData("users", `where id= ${user_id}`);

    if (check_user.length != 0) {
      const OFFLine_Status = await offline_Status(user_id);
      return res.json({
        message: "You are offline",
        success: true,
        status: 200,
      });
    } else {
      return res.json({
        message: "User not found please sign-up first",
        success: false,
        status: 400,
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.change_Password = async (req, res) => {
  try {
    const { password, confirm_password, user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
        confirm_password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await getData("users", `where id= ${user_id}`);

      if (check_user.length != 0) {
        if (password == confirm_password) {
          const hash = await bcrypt.hash(password, saltRounds);
          const result = await updatePassword(hash, password, user_id);
          const check_user = await getData("users", `where id= ${user_id}`);

          return res.json({
            message: "successfully password change",
            success: true,
            status: 200,
            user_info: check_user,
          });
        } else {
          return res.json({
            message: "Password and Confirm Password do not match ",
            success: false,
            status: 400,
          });
        }
      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.change_Password_after_login = async (req, res) => {
  try {
    const { old_password, password, confirm_password } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        old_password: [Joi.string().empty().required()],
        password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
        confirm_password: Joi.string().min(8).max(10).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 10 values allowed",
        }),
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const check_user = await getData("users", `where id= ${user_id}`);
      if (check_user[0].show_password == old_password) {
        if (password == confirm_password) {
          const data = await getData("users", `where  id= ${user_id}`);

          if (data.length !== 0) {
            // const update_show_password = await updatePassword_1(
            //   password,
            //   token
            // );
            const hash = await bcrypt.hash(password, saltRounds);
            const result2 = await updatePassword_2(password, hash, user_id);
            const data = await getData("users", `where id= ${user_id}`);
            return res.json({
              message: " password change successfully",
              success: true,
              status: 200,
              responce: data[0],
            });
          } else {
            return res.json({
              message: "User not found please sign-up first",
              success: false,
              status: 400,
            });
          }
        } else {
          return res.json({
            message: "Password and Confirm Password do not match ",
            success: false,
            status: 400,
          });
        }
      } else {
        return res.json({
          message: "old password does't match.",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.email_change = async (req, res) => {
  try {
    const { new_email, verify_Password } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        new_email: [Joi.string().empty().required()],
        verify_Password: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const check_user = await getData("users", `where id= ${user_id}`);
      if (check_user.length != 0) {
        const data = await getData("users", `where  id= ${user_id}`);
        const match = bcrypt.compareSync(verify_Password, data[0]?.password);
        if (match) {
          let data = `email = '${new_email}'`;
          let where = `where id = ${user_id}`;
          const result1 = await updateData("users", where, data);

          return res.json({
            success: true,
            message: "Email changed successfuly",
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Invalid password.",
            status: 400,
          });
        }
      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.add_Album = async (req, res) => {
  try {
    const { album_name } = req.body;
    let baseurlimage = ['1'];
    let images = [];
    const schema = Joi.alternatives(
      Joi.object({
        album_name: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let filename = "";
      const check_user = await getData("users", `where id= ${user_id}`);
      if (check_user.length != 0) {

        let albums = { 'user_id': user_id, album_name: album_name };
        const result = await Addalbums(albums);

        if (result.affectedRows > 0) {

          if (req.files) {
            const file = req.files;
            if (file.length != 0) {
              for (let i = 0; i < file.length; i++) {
                images.push(req.files[i].filename);
                if (req.files[i].filename) {
                  baseurlimage.push(baseurl + '/albums/' + req.files[i].filename);
                }
              }
            }
          }
          if (images.length > 0) {
            await Promise.all(images.map(async (item) => {
              let albums = { 'album_image': item, 'album_id': result.insertId, 'user_id': user_id };
              const result1 = await uploadAlbums(albums);
            }));
          }


          return res.json({
            message: "Photos Added to Albums Successfully",
            album_id: result.insertId,
            images: baseurlimage,
            success: true,
            status: 200,
          });
        } else {
          return res.json({
            message: "Something went wrong!",
            album_id: 0,
            success: true,
            status: 200,
          });
        }

      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.myAlbum = async (req, res) => {
  try {
    var array = [];
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;

    const user_info = await getData("users", `where id= ${user_id}`);

    if (user_info != 0) {
      const my_album = await MyAlbums(user_id);

      await Promise.all(
        my_album.map(async (item, i) => {


          if (item.profile_image != 'No image') {
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          } else {
            item.profile_image = "No image";
          }

          const albumphotos = await albumsPhotos(item.user_id, item.id);

          if (albumphotos.length > 0) {
            item.album_images = albumphotos;
            item.total_photos = albumphotos.length;
          } else {
            item.total_photos = 0;
            item.album_images = [];
          }

        })
      );
      var arraydata = { 'is_plus': '1' };
      my_album.unshift(arraydata);
      return res.json({
        status: 200,
        success: true,
        message: "My Albums Found Successfully!",
        user_info: my_album,
      });
    } else {
      return res.json({
        status: 400,
        success: false,
        message: "User Not Found",
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

exports.deleteAlbum = async (req, res) => {
  try {

    const { album_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);

      if (user_info != 0) {
        let where = ` where id= '${album_id}' and user_id = '${user_id}'`;
        const deletealbum = await deleteData('albums', where);

        if (deletealbum.affectedRows > 0) {
          return res.json({
            status: 200,
            success: true,
            message: "My Albums Delteted Successfully!",
          });

        } else {
          return res.json({
            status: 200,
            success: true,
            message: "Something went wrong!",

          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.uploadAlbum = async (req, res) => {
  try {
    const { album_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;
      let filename = "";
      const check_user = await getData("users", `where id= ${user_id}`);
      let images = [];
      let baseurlimage = ['1'];
      if (check_user.length != 0) {

        if (req.files) {
          const file = req.files;
          if (file.length != 0) {
            for (let i = 0; i < file.length; i++) {
              images.push(req.files[i].filename);
              if (req.files[i].filename) {
                baseurlimage.push(baseurl + '/albums/' + req.files[i].filename);

              }
            }
          } else {
            return res.json({
              message: "Please select image to upload.",
              success: false,
              status: 200,
            });

          }
        }

        if (images.length > 0) {
          await Promise.all(images.map(async (item) => {
            let albums = { 'album_image': item, 'album_id': album_id, 'user_id': user_id };
            const result = await uploadAlbums(albums);
          }));
          return res.json({
            message: "Photos Added to Albums Successfully",
            success: true,
            images: baseurlimage,
            status: 200,
          });

        } else {
          return res.json({
            message: "Something went wrong!",
            success: true,
            status: 200,
          });
        }

      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.myAlbumbyId = async (req, res) => {
  try {

    const { album_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);

      var arraydata = { 'is_plus': '1' };



      if (user_info != 0) {
        const my_album = await myAlbumbyId(user_id, album_id);

        await Promise.all(
          my_album.map(async (item, i) => {

            if (item.profile_image != 'No image') {
              item.profile_image = baseurl + "/profile/" + item.profile_image;
            } else {
              item.profile_image = "No image";
            }

            const albumphotos = await albumsPhotos(item.user_id, item.id);
            const share_count = await shared_to_count('albums_sharing', user_id, album_id);
            if (albumphotos.length > 0) {
              item.album_images = albumphotos;
              item.album_images.unshift(arraydata);
              item.total_photos = albumphotos.length - 1;
              item.share_count = share_count[0]?.share_to_count;
            } else {
              item.total_photos = 0;
              item.album_images = [];
              item.share_count = 0;
            }


          })
        );
        return res.json({
          status: 200,
          success: true,
          message: "My Albums Found Successfully!",
          my_album: my_album,
        });
      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.editAlbum = async (req, res) => {
  try {
    const { album_id, album_name } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().optional()],
        album_name: [Joi.string().empty().optional()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      let filename = "";
      const check_user = await getData("users", `where id= ${user_id}`);
      let images = [];
      let baseurlimage = ['1'];
      if (check_user.length != 0) {

        if (req.files) {
          const file = req.files;
          // if (file.length != 0) {
          for (let i = 0; i < file.length; i++) {
            images.push(req.files[i].filename);
            if (req.files[i].filename) {
              baseurlimage.push(baseurl + '/albums/' + req.files[i].filename);
            }
          }
          // } else {
          //   return res.json({
          //     message: "Please select image to upload.",
          //     success: false,
          //     status: 400,
          //   });

          // }
        }
        if (album_name) {
          const upalbum = await updateAlbum(album_name, album_id);
        }

        // if (images.length > 0) {
        await Promise.all(images.map(async (item) => {
          let albums = { 'album_image': item, 'album_id': album_id, 'user_id': user_id };
          const result = await uploadAlbums(albums);
        }));

        return res.json({
          message: "Photos Added to Albums Successfully",
          success: true,
          images: baseurlimage,
          status: 200,
        });

        // } else {
        //   return res.json({
        //     message: "Something went wrong!",
        //     success: true,
        //     status: 200,
        //   });
        // }

      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.deleteAlbumPhotos = async (req, res) => {
  try {

    const { id, album_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.string().empty().required()],
        album_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);

      if (user_info != 0) {
        let where = ` where id= '${id}' and album_id ='${album_id}'  and user_id = '${user_id}'`;
        const deletealbum = await deleteData('albums_photos', where);

        if (deletealbum.affectedRows > 0) {
          let currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
          let data = `updated_at = '${currentDate}'`;
          let wherealbum = `where id = ${album_id}`;
          const result1 = await updateData("albums", wherealbum, data);
          return res.json({
            status: 200,
            success: true,
            message: "My Albums Delteted Successfully!",
          });

        } else {
          return res.json({
            status: 200,
            success: true,
            message: "Something went wrong!",

          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.AlbumShare = async (req, res) => {
  try {

    const { album_id, shared_to } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().required()],
        shared_to: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await getData("users", `where id= ${user_id}`);

      if (user_info != 0) {


        let array = shared_to.split(',').map(Number);
        await Promise.all(
          array.map(async (item) => {
            let data = { "user_id": user_id, "album_id": album_id, "shared_to": item }
            const my_album = await insertAlbumShare(data);
          })
        );


        if (array.length > 0) {

          return res.json({
            status: 200,
            success: true,
            message: "Shared Successfully!",

          });
        } else {
          return res.json({
            status: 200,
            success: true,
            message: "No data found!",

          });
        }

      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.addProfileimage = async (req, res) => {
  try {
    const { user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: true,
      });
    } else {

      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
      }
      const userInfo = await fetchUserBy_Id(user_id);
      if (userInfo.length !== 0) {
        const usernmae_check = await username_Check(username, user_id);
        if (usernmae_check != 0) {
          return res.json({
            success: false,
            message:
              "Usernmae is already taken. Please use a different username.",
            status: 400,
          });
        }
        const result = await updateUserById(user, user_id);
        if (result.affectedRows) {
          return res.json({
            message: "update user successfully",
            status: 200,
            success: true,
          });
        } else {
          return res.json({
            message: "update user failed ",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          messgae: "data not found",
          status: 400,
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

exports.myAlbumSharing = async (req, res) => {
  try {
    var array = [];
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    var albumlimit = "";
    const user_info = await getData("users", `where id= ${user_id}`);
    let cheksub = await checkSubscriptionDetail(user_id);

    if (cheksub) {
      albumlimit = cheksub.album;
    } else {
      albumlimit = "";
    }

    const my_album = await MyAlbumsharing(user_id, '');
    if (user_info != 0) {

      await Promise.all(
        my_album.map(async (item, i) => {

          if (item.profile_image != 'No image') {
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          } else {
            item.profile_image = "No image";
          }

          const albumphotos = await albumsPhotos(item.user_id, item.id);

          if (albumphotos.length > 0) {
            item.album_images = albumphotos;
            item.total_photos = albumphotos.length;
          } else {
            item.total_photos = 0;
            item.album_images = [];
          }

        })
      );
      var arraydata = { 'is_plus': '1' };
      my_album.unshift(arraydata);
      return res.json({
        status: 200,
        success: true,
        message: "My Albums Found Successfully!",
        user_info: my_album,
        album_length: albumlimit
      });
    } else {
      return res.json({
        status: 400,
        success: false,
        message: "User Not Found",
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

exports.myAlbumbyIdsingle = async (req, res) => {
  try {

    const { album_id, user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        album_id: [Joi.string().empty().required()],
        user_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {


      const user_info = await getData("users", `where id= ${user_id}`);
      //var arraydata = {'is_plus':'1'};

      if (user_info != 0) {
        const my_album = await myAlbumbyId(user_id, album_id);

        await Promise.all(
          my_album.map(async (item, i) => {

            if (item.profile_image != 'No image') {
              item.profile_image = baseurl + "/profile/" + item.profile_image;
            } else {
              item.profile_image = "No image";
            }

            const albumphotos = await albumsPhotos(item.user_id, item.id);

            if (albumphotos.length > 0) {
              // 07032024 ameen
              // item.album_images = albumphotos.filter(photo => photo.album_image.endsWith('.jpg'));
              // item.album_videos = albumphotos.filter(photo => photo.album_image.endsWith('.mp4'));

              // Separate images and videos based on file extensions
              item.album_images = albumphotos.filter(photo => {
                const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
                const fileExtension = photo.album_image.slice(photo.album_image.lastIndexOf('.')).toLowerCase();
                return imageExtensions.includes(fileExtension);
              });

              item.album_videos = albumphotos.filter(photo => {
                const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov'];
                const fileExtension = photo.album_image.slice(photo.album_image.lastIndexOf('.')).toLowerCase();
                return videoExtensions.includes(fileExtension);
              });
              // 07032024 ameen
              // item.album_images = albumphotos;
              // item.album_images.unshift(arraydata);
              item.total_photos = albumphotos.length;
            } else {
              item.total_photos = 0;
              item.album_images = [];
            }


          })
        );
        return res.json({
          status: 200,
          success: true,
          message: "My Albums Found Successfully!",
          my_album: my_album,
        });
      } else {
        return res.json({
          status: 400,
          success: false,
          message: "User Not Found",
        });
      }
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

exports.delete_User = async (req, res) => {
  try {
    const { user_id, password } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserById(user_id);
      if (data.length !== 0) {

        const match = bcrypt.compareSync(password, data[0]?.password);
        if (match) {

          let where = ` where id= '${user_id}'`;
          const delete_user = await deleteData('users', where);

          let where1 = ` where user_id= '${user_id}'`;
          const delete_user1 = await deleteData('albums', where1);
          const delete_user2 = await deleteData('albums_photos', where1);
          const delete_user3 = await deleteData('chat_group', where1);
          const delete_user6 = await deleteData('user_subscription', where1);
          const delete_user9 = await deleteData('profile_images', where1);

          let where2 = ` where user_id= '${user_id}' OR favorite_user_id = '${user_id}'`;
          const delete_user4 = await deleteData('favorite_users', where2);

          let where3 = ` where user_id= '${user_id}' OR visit_user_id = '${user_id}'`;
          const delete_user5 = await deleteData('profile_visit', where3);

          let where4 = ` where sender_id= '${user_id}' OR reciver_id = '${user_id}'`;
          const delete_user7 = await deleteData('notifications', where4);

          let where5 = ` where user_id= '${user_id}' OR shared_to = '${user_id}'`;
          const delete_user8 = await deleteData('albums_sharing', where5);


          return res.json({
            status: 200,
            success: true,
            message: "Delete successful!",
          });
        } else {
          return res.json({
            success: false,
            message: "Invalid password.",
            status: 400,
          });
        }
      } else {
        return res.json({
          message: "Account not found. Please check your details",
          status: 400,
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.group_notification = async (req, res) => {
  try {

    const { user_id, id, group_name, group_id, public } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        id: Joi.array().items(Joi.number().required()).required(),
        group_name: [Joi.string().empty().required()],
        user_id: [Joi.number().empty().required()],
        group_id: [Joi.string().empty().required()],
        public: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParms: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const serverKey = Fcm_serverKey;
      const fcm = new FCM(serverKey);

      // Fetch user data outside the loop if it's the same for all iterations
      const userData = await fetchUserBy_Id(user_id);

      // Use Promise.all to wait for all asynchronous operations to complete
      await Promise.all(id.map(async (id_1) => {
        const userFcm = await fetch_fcm(id_1);
        const message = {
          to: userFcm[0]?.fcm_token,
          notification: {
            user_id: id_1,
            title: "Group_notification",
            body: `${userData[0].username} Invited you in ${group_name} group`,
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },
          data: {
            user_id: user_id,
            group_name: group_name,
          },
        };

        return new Promise((resolve) => {
          fcm.send(message, async (err, response) => {
            if (err) {
              // Handle the error, but don't send the response here
              console.error("Error:", err);
              resolve({ success: false });
            } else {
              // Handle the success, but don't send the response here
              const sendNotification = {
                sender_id: user_id,
                reciver_id: id_1,
                group_id: group_id,
                group_name: group_name,
                public: public,
                body: `Invited you in group`,

                notification_type: 1,
              };
              await addnotification(sendNotification);
              resolve({ success: true });
            }
          });
        });
      }));

      // Now, after all promises are resolved, send the final response
      res.json({
        message: "Notifications sent successfully",
        success: true,
        status: 200,
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

exports.addProfileimages = async (req, res) => {
  try {

    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    let filename = "";
    const check_user = await getData("users", `where id= ${user_id}`);
    let images = [];
    let baseurlimage = ['1'];
    if (check_user.length != 0) {

      if (req.files) {
        const file = req.files;
        if (file.length <= 5) {
          for (let i = 0; i < file.length; i++) {
            images.push(req.files[i].filename);
            if (req.files[i].filename) {
              baseurlimage.push(baseurl + '/profile/' + req.files[i].filename);
            }
          }
        } else {
          return res.json({
            message: "Please select aleast 5 images to upload.",
            success: false,
            status: 200,
          });

        }
      }

      if (images.length > 0) {
        await Promise.all(images.map(async (item) => {
          let imagesName = { 'image': item, 'user_id': user_id };
          const result = await addProfileimages(imagesName);
        }));
        const deleteimage = await deleteProfileimages(user_id);
        return res.json({
          message: "Photos Added to Profile Successfully",
          success: true,
          images: baseurlimage,
          status: 200,
        });

      } else {
        return res.json({
          message: "Something went wrong!",
          success: true,
          status: 200,
        });
      }

    } else {
      return res.json({
        message: "User not found please sign-up first",
        success: false,
        status: 400,
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.accept_reject_group_invite = async (req, res) => {
  try {
    const { notification_id, status } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        notification_id: [Joi.number().empty().required()],
        status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const notification_check = await check_notification(notification_id);
      if (notification_check.length > 0) {

        if (status == 1) {
          const update_notification = await check_notification(notification_id, status);
          return res.json({
            success: true,
            message: " accepted Successfully",
            status: 200
          });
        } else if (status == 2) {

          let where = ` where id= '${notification_id}' `;
          const deletealbum = await deleteData('notifications', where);

          return res.json({
            success: true,
            message: " rejected Successfully ",
            status: 200
          });
        }



      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.profile_visit = async (req, res) => {
  try {
    const { user_id, visit_user_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        visit_user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_info = await Get_user_info(user_id);
      if (user_info.length > 0) {

        const getprofileVisit = await getAllprofileVist(user_id, visit_user_id);

        console.log("getProfileVisit", getprofileVisit)

        if (getprofileVisit.length == 0) {
          const profile_vist_1 = await profile_vist(user_id, visit_user_id);
          return res.json({
            success: true,
            message: "Successfully",
            status: 200,
          });
        } else {
          return res.json({
            success: true,
            message: "Aready Visted!",
            status: 200,
          });

        }


      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.get_profile_visit = async (req, res) => {
  try {
    const { user_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_info = await Get_user_info(user_id);

      if (user_info.length > 0) {

        // const Get_profile_vist = await get_profile_vist(user_id);
        const Get_profile_vist = await fetchVisitsInPast24Hours(user_id);
        const checkSubscription = await checkSubscriptionDetail(user_id);
        await Promise.all(
          Get_profile_vist.map(async (item) => {


            // if (item.latitude != null && item.latitude != "" && item.longitude != null && item.longitude != "") {
            if (item.latitude != null && item.latitude != "" && item.latitude != undefined && item.longitude != null && item.longitude != "" && item.longitude != undefined) {
              const unit = 'metric';
              const origin = user_info[0]?.latitude + ',' + user_info[0]?.longitude;
              const destination = item.latitude + '%2C' + item.longitude;
              try {
                const disvalue = await distanceShow(unit, origin, destination);
                //  item.distance = disvalue;
              } catch (error) {
                console.error('Error in yourAsyncFunction:', error);
                // Handle errors as needed
              }
              // const distance = calculateDistance(user_info[0]?.latitude, user_info[0]?.longitude, item.latitude, item.longitude);

              // if (distance.toFixed(2) != "NaN") {
              //   item.distance = distance.toFixed(2)
              // } else {
              //   item.distance = "0";
              // }
            } else {
              // item.distance = "0"
            }


            let visitor_id = item.user_id

            const user_info = await Get_user_info(visitor_id);

            if (user_info[0].profile_image != "No image") {
              // item.profile_image = baseurl + "/profile/" + item.profile_image;
              user_info[0].profile_image = baseurl + "/profile/" + user_info[0].profile_image;
            }

            item.visit_user_username = user_info[0].username
            item.visit_user_profile_image = user_info[0].profile_image
            item.id = item.user_id
            item.admin = false
            item.isBlockStatus = 0

          })
        );

        if (Get_profile_vist.length > 0) {

          const updateprofileview = await update_viewed_profile(user_id);

          return res.json({
            success: true,
            message: "Successfully",
            status: 200,
            Subscription: checkSubscription.plan_name,
            Get_profile_vist: Get_profile_vist,
            vist_count: Get_profile_vist ? Get_profile_vist.length : 0

          });
        } else {
          return res.json({
            success: true,
            message: "No Data Found",
            status: 200,
          });
        }

      } else {
        return res.json({
          success: false,
          message: "User Not Found",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.Allnotification = async (req, res) => {
  try {
    const { user_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const currentDate = moment();
      const current_date = currentDate.format('YYYY-MM-DD');
      const notification = await Allnotification(user_id);
      if (notification.length > 0) {

        await Promise.all(notification.map(async (item) => {

          const owner_info = await Get_user_info(item.sender_id);

          item.username = owner_info[0]?.username ? owner_info[0]?.username : "";
          item.profile_image = owner_info[0]?.profile_image ? baseurl + "/profile/" + owner_info[0]?.profile_image : "";
          const created_at = moment(item.created_at);
          const dateAfter7Days = created_at.add(7, 'days');
          const formattedDateAfter7Days = dateAfter7Days.format('YYYY-MM-DD');
          if (current_date == formattedDateAfter7Days) {
            const deleteuser = await deleteNotification(item.id);
          }

        }));


        return res.json({
          success: true,
          message: "Successfully fetch Notification",
          notification: notification,
          status: 200,
        });
      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.Createchatgroup = async (req, res) => {
  try {
    const { group_id, group_name, description, tag } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        group_id: [Joi.string().empty().required()],
        group_name: [Joi.string().empty().required()],
        description: [Joi.string().empty().required()],
        tag: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
      }

      const user_info = await Get_user_info(user_id);
      if (user_info.length > 0) {
        let groupdetail = {
          group_id: group_id,
          group_name: group_name,
          description: description,
          tag: tag,
          user_id: user_id,
          group_image: filename ? filename : ""
        }

        const getprofileVisit = await groupChat(group_id);

        if (getprofileVisit.length == 0) {
          const chatgroup = await insertgroup(groupdetail);
          return res.json({
            success: true,
            message: "Successfully",
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "This group is already created!",
            status: 400,
          });

        }

      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.groupchatByid = async (req, res) => {
  try {
    const { group_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        group_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;


      const user_info = await Get_user_info(user_id);
      if (user_info.length > 0) {

        const groupchat = await groupChat(group_id);

        if (groupchat.length > 0) {

          await Promise.all(
            groupchat.map(async (item) => {
              if (item.group_image != "") {

                item.group_image = baseurl + "/group/" + item.group_image;
              } else {
                item.group_image = "";
              }
            })
          );


          return res.json({
            success: true,
            message: "Successfully",
            status: 200,
            groupchat: groupchat
          });
        } else {
          return res.json({
            success: false,
            message: "No data found!",
            status: 400,
          });

        }
      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.appVerification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;


    let filename = "";
    if (req.file) {
      const file = req.file;
      filename = file.filename;
    }
    const user_info = await Get_user_info(user_id);
    if (user_info.length > 0) {

      let data = { "user_id": user_id, "image": filename };
      const appverifyImage = await appVerificationImage(data);

      const appverify = await appVerification(user_id);

      if (appverify.affectedRows > 0 && appverifyImage.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Successfully Verified!",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "No data found!",
          status: 400,
        });
      }
    } else {
      return res.json({
        success: true,
        message: "No Data Found",
        notification: [],
        status: 200,
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.new_users = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    const check_user = await Get_user_info(user_id);

    const get_all_new_users = await Get_new_users(user_id)
    // Checking if the user is already in the database
    if (get_all_new_users.length != 0) {
      await Promise.all(
        get_all_new_users.map(async (item) => {

          const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
          item.distance_status = (settingshow_me[0]?.distance == 1) ? true : false


          if (item.latitude != null && item.latitude != "" && item.latitude != undefined && item.longitude != null && item.longitude != "" && item.longitude != undefined) {
            const unit = 'metric';
            const origin = check_user[0]?.latitude + ',' + check_user[0]?.longitude;
            const destination = item.latitude + '%2C' + item.longitude;
            try {
              const disvalue = await distanceShow(unit, origin, destination);
              if (disvalue.distance) {
                item.distance = disvalue.distance;
              }

              // item.distance_status=true;
            } catch (error) {
              console.error('Error in yourAsyncFunction:', error);
              // Handle errors as needed
            }
          } else {
            item.distance = "0";
            // item.distance_status=false;
          }


          if (item.profile_image != "No image") {
            // item.profile_image = baseurl + "/profile/" + item.profile_image;
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          }

        })
      );

      return res.json({
        success: true,
        message: "Successfully Verified!",
        status: 200,
        get_all_new_users: get_all_new_users,
      });
    } else {
      return res.json({
        success: false,
        message: "No data found",
        status: 200,
        get_all_new_users: [],
      });
    }


  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

// distance NearBy
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = R * c; // Distance in meters
  const distanceKilometers = distanceMeters / 1000; // Convert meters to kilometers

  return {
    meters: distanceMeters,
    kilometers: distanceKilometers
  };
}

// distance NearBy
exports.users_nearby = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    const nearbyRange = 10000; // Check if distance is within 10 kilometers (10,000 meters)
    const check_user = await fetchUserById(user_id);
    let locations = [];
    let NearLocation = [];

    if (check_user.length !== 0) {
      const userLatitude = check_user[0]?.latitude;
      const userLongitude = check_user[0]?.longitude;
      const allUserNearBy = await Get_nearby_users(user_id);
      await Promise.all(
        allUserNearBy.map(async (item) => {

          if (item.profile_image != "No image") {
            // item.profile_image = baseurl + "/profile/" + item.profile_image;
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          }



          const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
          item.explore_status = (settingshow_me[0]?.explore == 1) ? true : false;
          item.distance_status = (settingshow_me[0]?.distance == 1) ? true : false;

          if (item.latitude != null && item.latitude !== "" && item.latitude !== undefined && item.longitude != null && item.longitude !== "" && item.longitude !== undefined) {
            locations.push({ 'name': item.name, 'UserId': item.id, 'latitude': item.latitude, 'longitude': item.longitude });

            const unit = 'metric';
            const origin = userLatitude + ',' + userLongitude;
            const destination = item.latitude + '%2C' + item.longitude;
            const disvalue = await distanceShownear(unit, origin, destination);

            if (disvalue.distanceValue <= nearbyRange) {
              // item.distance_status = true;
              item.distance = disvalue.distance;
              const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
              item.distance_status = (settingshow_me[0]?.distance == 1) ? true : false

              NearLocation.push(item);
            } else {
              // item.distance_status = false;
              item.distance = disvalue.distance;
            }
            const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
            item.distance_status = (settingshow_me[0]?.distance == 1) ? true : false

            //NearLocation.push(item);
          }
        })
      );

      return res.json({
        success: true,
        message: "Successfully Verified!",
        status: 200,
        count: NearLocation.length,
        Get_nearby_users: NearLocation,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

function distanceShownear(units, origins, destinations) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=${units}&origins=${origins}&destinations=${destinations}&key=${googledistance_key}`;

    axios.get(apiUrl)
      .then(response => {
        // Handle the response here
        const distanceObj = response.data.rows[0]?.elements[0];

        if (distanceObj.distance) {
          const distanceValue = distanceObj.distance.value; // Distance in meters

          // if (distanceValue <= 200) { // Check if distance is within 10 kilometers (10,000 meters)
          const distance = distanceObj.distance.text;
          // resolve(distance,distanceValue);
          resolve({ distance, distanceValue });
          // } else {
          //   resolve("outofrange");
          // }
        } else {
          resolve("No distance information available");
        }
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
        reject(error);
      });
  });
}


// exports.users_nearby = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token_1 = authHeader;
//     const token = token_1.replace("Bearer ", "");
//     const decoded = jwt.decode(token);
//     const user_id = decoded.data.id;
//     const nearByDistance = 10 + '.0 km'; // Radius in meters
//     const check_user = await fetchUserById(user_id);
//     let NearLocation = [];

//     if (check_user.length !== 0) {
//       const allUserNearBy = await Get_nearby_users(user_id);
//       await Promise.all(
//         allUserNearBy.map(async (item) => {
//           const settingshow_me = await getData("setting_show_me", `where user_id= ${item.id}`);
//           item.explore_status = settingshow_me[0]?.explore === 1 ? true : false;
//           item.distance_status = settingshow_me[0]?.distance === 1 ? true : false;

//           if (
//             item.latitude != null &&
//             item.latitude != "" &&
//             item.latitude != undefined &&
//             item.longitude != null &&
//             item.longitude != "" &&
//             item.longitude != undefined
//           ) {
//             const unit = 'metric';
//             const origin = check_user[0]?.latitude + ',' + check_user[0]?.longitude;
//             const destination = item.latitude + '%2C' + item.longitude;

//             try {
//               const disvalue = await distanceShownear(unit, origin, destination);
//               console.log(">>>>>>>>>>>>>>>>>>>disvalue", item.name + ' ' + disvalue);
//               console.log(">>>>>>>>>>>>>>>>>>>nearByDistance", nearByDistance);
//               item.distance = disvalue <= nearByDistance ? disvalue : 0;
//               item.distance_status = disvalue <= nearByDistance ? true : false;

//               if (disvalue <= nearByDistance) {
//                 if (item.profile_image !== "No image") {
//                   item.profile_image = baseurl + "/profile/" + item.profile_image;
//                 }
//                 NearLocation.push(item);
//               }
//             } catch (error) {
//               console.error('Error in distance calculation:', error);
//               // Handle errors as needed
//             }
//           }
//         })
//       );
//        console.log(">>>>>>>>>>>>>>>>>>>nearByDistance", nearByDistance);

//       return res.json({
//         success: true,
//         message: "Successfully Verified!",
//         status: 200,
//         totalCount: NearLocation.length,
//         Get_nearby_users: NearLocation,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "An internal server error occurred. Please try again later.",
//       status: 500,
//       error: error,
//     });
//   }
// };


exports.maps = async (req, res) => {
  try {
    const axios = require('axios');

    // Replace 'YOUR_API_KEY' with your actual HERE API key
    const apiKey = 'aIOc5ItQLdCfqBxlEOozaSme7-KdfGgSuatemfynJ_8';

    // Example: Get speed limit for a specific location
    const location = '18.77492200,84.40980100qqweertyqwertp[]\  1278';  // Berlin, Germany

    const apiUrl = `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?waypoint0=${location}&waypoint1=${location}&mode=fastest;car;traffic:disabled&apiKey=${apiKey}`;

    axios.get(apiUrl)
      .then(response => {
        const speedLimit = response.data.response.route[0].leg[0].maneuver[0].speedLimit;
      })
      .catch(error => {
        console.error('Error retrieving speed limit:', error.message);
      });


  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.allShowme = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token_1 = authHeader;
    const token = token_1.replace("Bearer ", "");
    const decoded = jwt.decode(token);
    const user_id = decoded.data.id;
    let subscription_id = 0;
    const user_info = await fetchUserBy_Id(user_id);
    if (user_info.length > 0) {

      const settingshow_me = await getData(
        "setting_show_me",
        `where user_id= ${user_id}`
      );

      let cheksub = await checkSubscriptionDetail(user_id);

      if (cheksub) {
        if (cheksub.id == 6) {
          subscription_id = 1;
        } else {
          subscription_id = 0;
        }

      } else {
        subscription_id = 0;
      }

      if (settingshow_me.length > 0) {
        return res.json({
          success: true,
          message: "Successfully Verified!",
          status: 200,
          settingshow_me: settingshow_me,
          subscription_id: subscription_id
        });
      } else {
        return res.json({
          success: true,
          message: "No data found!",
          settingshow_me: [],
          status: 200,
          subscription_id: subscription_id
        });
      }
    } else {
      return res.json({
        success: true,
        message: "No Data Found",
        settingshow_me: [],
        status: 200,
        subscription_id: subscription_id
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.addShowme = async (req, res) => {
  try {

    const { explore, distance, view_me } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        explore: [Joi.string().empty().required()],
        distance: [Joi.string().empty().required()],
        view_me: [Joi.string().empty().required()],

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      const user_info = await fetchUserBy_Id(user_id);
      if (user_info.length > 0) {

        let setting = {
          explore: explore, distance: distance, view_me: view_me, user_id: user_id
        }

        const settingshow_me = await getData("setting_show_me", `where user_id= ${user_id}`);
        if (view_me == 1) {
          let checksub = await checkSubscriptionDetail(user_id);
          if (checksub?.id != 6) {
            return res.json({
              message: " To use this feature please upgrade to full plan  ",
              success: false,
              status: 400,
            });
          }
        }

        if (settingshow_me.length > 0) {
          const addsettingshow = updateShowme(explore, distance, view_me, user_id);
          const settingshow_me1 = await getData(
            "setting_show_me",
            `where user_id= ${user_id}`
          );
          return res.json({
            success: true,
            message: "Successfully Show Me!",
            status: 200,
            settingshow_me: settingshow_me1
          });
        } else {
          const addsettingshow = addShowme(setting);
          const settingshow_me1 = await getData(
            "setting_show_me",
            `where user_id= ${user_id}`
          );
          return res.json({
            success: true,
            message: "Successfully Show Me!",
            status: 200,
            settingshow_me: settingshow_me1
          });
        }
      } else {
        return res.json({
          success: true,
          message: "No Data Found",
          notification: [],
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.send_notification = async (req, res) => {
  try {
    const { sender_id, reciver_id, notification_type, group_id, notification_id, group_name, body, title } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        sender_id: [Joi.number().empty().required()],
        reciver_id: [Joi.optional().allow("")],
        notification_type: [Joi.string().empty().required()],
        group_id: [Joi.string().empty().optional()],
        notification_id: [Joi.number().empty().optional()],
        group_name: [Joi.string().empty().optional()],
        body: [Joi.string().empty().optional()],
        title: [Joi.string().empty().optional()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParms: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      if (notification_type == 'visit') {

        const serverKey = Fcm_serverKey

        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);

        const Get_fcm = await fetch_fcm(reciver_id);

        let where = "WHERE sender_id = '" + sender_id + "' AND reciver_id = '" + reciver_id + "' AND notification_type='visit' ";
        const checkvisit = await getSelectedColumn("`notifications`", where, "*");

        console.log("check Visit", checkvisit);
        console.log("Get_fcm[0].dont_disturb", Get_fcm[0].dont_disturb)

        if (checkvisit.length == 0 && Get_fcm[0].dont_disturb == 1) {
          console.log("here it is")
          let user_id = sender_id
          const send_notification = {
            user_id: reciver_id,
            sender_id: sender_id,
            reciver_id: reciver_id,
            body: "visit profile",
            // username: data[0].username,
            // profile_image: 'http://64.225.88.156:5000/profile/' + data[0].profile_image,
            notification_type: "visit",
          };

          const result = await addnotification(send_notification);

          return res.json({
            message: "notification send successfull",
            Response: [],
            success: true,
            status: 200
          });

        } else if (checkvisit.length > 0) {
          return res.json({
            message: "Already visit",
            Response: [],
            success: true,
            status: 200
          });
        }

        else if (checkvisit.length == 0 && Get_fcm[0].dont_disturb != 1) {

          const message = {
            to: Get_fcm[0].fcm_token,
            notification: {
              user_id: sender_id,
              title: "visit profile",
              body: data[0].username + " visit your profile",
              icon: "icon_name_here",
              click_action: "notification_click_action_here",
              sound: "default",
              icon: "fcm_push_icon",
            },

            data: {
              sender_id: sender_id,
              reciver_id: reciver_id,
              screen: 'visit profile',
            },
          };

          fcm.send(message, async (err, response) => {
            if (err) {
              return res.json({
                message: "Error",
                Error: err,
                success: false,
                status: 500
              });
            } else {

              let user_id = sender_id
              const send_notification = {
                user_id: reciver_id,
                sender_id: sender_id,
                reciver_id: reciver_id,
                body: "visit profile",
                // username: data[0].username,
                // profile_image: 'http://64.225.88.156:5000/profile/' + data[0].profile_image,
                notification_type: "visit",
              };

              const result = await addnotification(send_notification);

              return res.json({
                message: "notification send successfull",
                Response: response,
                success: true,
                status: 200
              });
            }
          })
        }

      }
      else if (notification_type == 'group_request') {


        let array = [];
        const serverKey = Fcm_serverKey

        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);
        let reciver_id1 = reciver_id.replace(/\[|\]/g, '');
        const allFcmTokens = await getData("users", ` where id IN (${reciver_id1})`);
        // const Get_fcm = await fetch_fcm(reciver_id);
        const message = {
          notification: {
            user_id: id,
            title: "Group Request",
            body: data[0].username + " requested to add you to the group!",
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },
          data: {
            sender_id: sender_id,
            notification_type: "group_request",
            screen: 'group request',
          },
        };

        // Send notification to each FCM token
        const sendNotifications = async () => {
          try {
            await Promise.all(allFcmTokens.map(async (token) => {
              try {
                if (token.dont_disturb == 1) {
                  return; // Return early to skip processing for this token
                }

                await new Promise((resolve, reject) => {


                  fcm.send({ ...message, to: token.fcm_token }, async (err, result) => {
                    if (err) {
                      console.error("Error sending notification to:", token.fcm_token, err);
                      reject(err);
                    } else {
                      const send_notification = {
                        user_id: token.id,
                        sender_id: sender_id,
                        reciver_id: token.id,
                        group_id: group_id,
                        group_name: group_name,
                        request_status: 3,
                        body: data[0].username + " requested to add in the group!",
                        notification_type: "group_request",
                      };

                      const result1 = await addnotification(send_notification);
                      resolve(result);
                    }
                  });
                });
              } catch (error) {
                console.error("Error sending notification to:", token.id, error);
              }
            }));
            // Send response after sending notifications
            return res.json({
              message: "Notifications sent successfully to all users",
              success: true,
              Response: [],
              status: 200
            });
          } catch (error) {
            console.error("Error sending notifications:", error);
            res.status(500).json({
              message: "Error sending notifications",
              success: false,
              status: 500
            });
          }
        };

        await sendNotifications();


      }
      else if (notification_type == 'request_accept') {

        const serverKey = Fcm_serverKey

        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);

        const Get_fcm = await fetch_fcm(reciver_id);

        if (Get_fcm[0].dont_disturb_mode == 1) {
          let user_id = sender_id
          const send_notification = {
            user_id: reciver_id,
            sender_id: sender_id,
            reciver_id: reciver_id,
            group_id: group_id,
            request_status: 1,
            body: data[0].username + " accepted your request to add in the group!",
            notification_type: "request_accept",
          };

          const result = await addnotification(send_notification);
          //notification_id
          return res.json({
            message: "notification send successfull",
            success: true,
            status: 200
          });

        }

        const message = {
          to: Get_fcm[0].fcm_token,
          notification: {
            user_id: sender_id,
            title: "group request",
            body: data[0].username + " accepted your request to add in the group!",
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },

          data: {
            sender_id: sender_id,
            reciver_id: reciver_id,
            notification_type: "request_accept",
            screen: 'group request',
          },
        };

        fcm.send(message, async (err, response) => {
          if (err) {
            return res.json({
              message: "Error",
              Error: err,
              success: false,
              status: 500
            });
          } else {

            let user_id = sender_id
            const send_notification = {
              user_id: reciver_id,
              sender_id: sender_id,
              reciver_id: reciver_id,
              group_id: group_id,
              request_status: 1,
              body: data[0].username + " accepted your request to add in the group!",
              notification_type: "request_accept",
            };

            if (notification_id) {
              const updatenoti = await updateReqnotification(notification_id, 1)
            }


            const result = await addnotification(send_notification);
            //notification_id
            return res.json({
              message: "notification send successfull",
              Response: response,
              success: true,
              status: 200
            });
          }
        })

      }
      else if (notification_type == 'request_reject') {

        const serverKey = Fcm_serverKey

        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);

        const Get_fcm = await fetch_fcm(reciver_id);

        if (Get_fcm[0].dont_disturb == 1) {

          let user_id = sender_id
          const send_notification = {
            user_id: reciver_id,
            sender_id: sender_id,
            reciver_id: reciver_id,
            group_id: group_id,
            request_status: 2,
            body: data[0].username + " rejected your request to add in the group!",
            notification_type: "request_reject",
          };
          if (notification_id) {
            const updatenoti = await updateReqnotification(notification_id, 2)
          }

          const result = await addnotification(send_notification);

          return res.json({
            message: "notification send successfull",
            success: true,
            status: 200
          });


        }

        const message = {
          to: Get_fcm[0].fcm_token,
          notification: {
            user_id: sender_id,
            title: "group request",
            body: data[0].username + " rejected your request to add in the group!",
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },

          data: {
            sender_id: sender_id,
            reciver_id: reciver_id,
            notification_type: "request_reject",
            screen: 'group request',
          },
        };

        fcm.send(message, async (err, response) => {
          if (err) {
            return res.json({
              message: "Error",
              Error: err,
              success: false,
              status: 500
            });
          } else {

            let user_id = sender_id
            const send_notification = {
              user_id: reciver_id,
              sender_id: sender_id,
              reciver_id: reciver_id,
              group_id: group_id,
              request_status: 2,
              body: data[0].username + " rejected your request to add in the group!",
              notification_type: "request_reject",
            };
            if (notification_id) {
              const updatenoti = await updateReqnotification(notification_id, 2)
            }

            const result = await addnotification(send_notification);

            return res.json({
              message: "notification send successfull",
              Response: response,
              success: true,
              status: 200
            });
          }
        })

      }
      else if (notification_type == 'chat') {

        let array = [];
        const serverKey = Fcm_serverKey
        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);
        let reciver_id1 = reciver_id.replace(/\[|\]/g, '');
        const allFcmTokens = await getData("users", ` where id IN (${reciver_id1})`);
        // const Get_fcm = await fetch_fcm(reciver_id);
        const message = {
          notification: {
            user_id: sender_id,
            title: title,
            body: body,
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },
          data: {
            sender_id: sender_id,
            reciver_id: reciver_id,
            notification_type: "chat",
            screen: 'chat',
          },
        };
        // Send notification to each FCM token
        const sendNotifications = async () => {
          try {
            await Promise.all(allFcmTokens.map(async (token) => {
              try {
                if (token.dont_disturb == 1 || token.chat_notification == 0) {
                  return; // Return early to skip processing for this token
                }
                await new Promise((resolve, reject) => {
                  fcm.send({ ...message, to: token.fcm_token }, async (err, result) => {
                    if (err) {
                      console.error("Error sending notification to:", token.fcm_token, err);
                      reject(err);
                    } else {
                      const send_notification = {
                        user_id: token.id,
                        sender_id: sender_id,
                        reciver_id: token.id,
                        group_id: group_id,
                        group_name: group_name,
                        request_status: 3,
                        body: data[0].username + " requested to add in the group!",
                        notification_type: "group_request",
                      };

                      //    const result1 = await addnotification(send_notification);
                      resolve(result);
                    }
                  });
                });
              } catch (error) {
                console.error("Error sending notification to:", token.id, error);
              }
            }));
            // Send response after sending notifications
            return res.json({
              message: "Notifications sent successfully to all users",
              success: true,
              // Response: [],
              status: 200
            });
          } catch (error) {
            console.error("Error sending notifications:", error);
            res.status(500).json({
              message: "Error sending notifications",
              success: false,
              status: 500
            });
          }
        };
        await sendNotifications();
      }
      else if (notification_type == 'chatGroup') {

        let array = [];
        const serverKey = Fcm_serverKey
        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);
        let reciver_id1 = reciver_id.replace(/\[|\]/g, '');
        const allFcmTokens = await getData("users", ` where id IN (${reciver_id1})`);
        // const Get_fcm = await fetch_fcm(reciver_id);
        const message = {
          notification: {
            user_id: sender_id,
            title: title,
            body: body,
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },
          data: {
            sender_id: sender_id,
            reciver_id: reciver_id,
            notification_type: "chat",
            screen: 'chat',
          },
        };
        // Send notification to each FCM token
        const sendNotifications = async () => {
          try {
            await Promise.all(allFcmTokens.map(async (token) => {
              try {
                if (token.dont_disturb == 1 || token.group_notification == 0) {
                  return; // Return early to skip processing for this token
                }
                await new Promise((resolve, reject) => {
                  fcm.send({ ...message, to: token.fcm_token }, async (err, result) => {
                    if (err) {
                      console.error("Error sending notification to:", token.fcm_token, err);
                      reject(err);
                    } else {
                      const send_notification = {
                        user_id: token.id,
                        sender_id: sender_id,
                        reciver_id: token.id,
                        group_id: group_id,
                        group_name: group_name,
                        request_status: 3,
                        body: data[0].username + " requested to add in the group!",
                        notification_type: "group_request",
                      };

                      //    const result1 = await addnotification(send_notification);
                      resolve(result);
                    }
                  });
                });
              } catch (error) {
                console.error("Error sending notification to:", token.id, error);
              }
            }));
            // Send response after sending notifications
            return res.json({
              message: "Notifications sent successfully to all users",
              success: true,
              // Response: [],
              status: 200
            });
          } catch (error) {
            console.error("Error sending notifications:", error);
            res.status(500).json({
              message: "Error sending notifications",
              success: false,
              status: 500
            });
          }
        };
        await sendNotifications();
      }
      else if (notification_type == 'chatTap') {

        let array = [];
        const serverKey = Fcm_serverKey
        const fcm = new FCM(serverKey);
        let id = sender_id
        let data = await fetchUserBy_Id(id);
        let reciver_id1 = reciver_id.replace(/\[|\]/g, '');
        const allFcmTokens = await getData("users", ` where id IN (${reciver_id1})`);
        // const Get_fcm = await fetch_fcm(reciver_id);
        const message = {
          notification: {
            user_id: sender_id,
            title: title,
            body: body,
            icon: "icon_name_here",
            click_action: "notification_click_action_here",
            sound: "default",
            icon: "fcm_push_icon",
          },
          data: {
            sender_id: sender_id,
            reciver_id: reciver_id,
            notification_type: "chatTap",
            screen: 'chat',
          },
        };
        // Send notification to each FCM token
        const sendNotifications = async () => {
          try {
            await Promise.all(allFcmTokens.map(async (token) => {
              try {
                if (token.dont_disturb == 1 || token.taps_notification == 0) {
                  return;
                }
                await new Promise((resolve, reject) => {
                  fcm.send({ ...message, to: token.fcm_token }, async (err, result) => {
                    if (err) {
                      console.error("Error sending notification to:", token.fcm_token, err);
                      reject(err);
                    } else {
                      const send_notification = {
                        user_id: token.id,
                        sender_id: sender_id,
                        reciver_id: token.id,
                        group_id: group_id,
                        group_name: group_name,
                        request_status: 3,
                        body: data[0].username + " requested to add in the group!",
                        notification_type: "group_request",
                      };

                      //    const result1 = await addnotification(send_notification);
                      resolve(result);
                    }
                  });
                });
              } catch (error) {
                console.error("Error sending notification to:", token.id, error);
              }
            }));
            // Send response after sending notifications
            return res.json({
              message: "Notifications sent successfully to all users",
              success: true,
              // Response: [],
              status: 200
            });
          } catch (error) {
            console.error("Error sending notifications:", error);
            return res.status(500).json({
              message: "Error sending notifications",
              success: false,
              status: 500
            });
          }
        };
        await sendNotifications();
      } else {
        return res.json({
          success: false,
          message: " invild notification_type",
          error: err,
          status: 500,
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

exports.changePasswordbefore = async (req, res) => {
  try {
    const { password, confirm_password, email, phone_number } = req.body;
    const token = JSON.parse(localStorage.getItem("vertoken"));
    const schema = Joi.alternatives(
      Joi.object({
        email: [
          Joi.string()
            .min(5)
            .max(255)
            .email({ tlds: { allow: false } })
            .lowercase()
            .optional().allow("")
        ],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
        confirm_password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
        phone_number: [Joi.optional().allow("")],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      res.render(path.join(__dirname + "/view/", "forgetPassword.ejs"), {
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        msg: message,
      });
    } else {
      if (password == confirm_password) {

        const data = await fetchUserByphoneEmail(email, phone_number)

        if (data.length !== 0) {

          const hash = await bcrypt.hash(password, saltRounds);
          const result2 = await updatePassword(password, hash, data[0].id);

          if (result2) {
            return res.json({
              success: true,
              message: "Password updated!",
              status: 200,
            });
          } else {
            return res.json({
              success: false,
              message: "Password not updated!",
              status: 400,
            });
          }
        } else {
          return res.json({
            message: "User not found!",
            success: false,
            status: 400,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Password and Confirm Password do not match",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });

  }
};


exports.getGroupRequest = async (req, res) => {
  const { user_id, group_id } = req.body;
  const schema = Joi.alternatives(
    Joi.object({
      user_id: [Joi.number().empty().required()],
      group_id: [Joi.string().empty().required()],
    })
  );
  const result = schema.validate(req.body);
  if (result.error) {
    const message = result.error.details.map((i) => i.message).join(",");
    return res.json({
      message: result.error.details[0].message,
      error: message,
      missingParams: result.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {

    const notification = await Allnotificationbyuser_id(user_id, group_id);
    if (notification.length > 0) {

      await Promise.all(notification.map(async (item) => {

        const owner_info = await Get_user_info(item.reciver_id);

        item.username = owner_info[0]?.username ? owner_info[0]?.username : "";
        item.profile_image = owner_info[0]?.profile_image ? baseurl + "/profile/" + owner_info[0]?.profile_image : "";

      }));

      return res.json({
        status: 200,
        success: true,
        message: "User fetch successful",
        user_info: notification,
      });
    } else {
      // Handle the case where user_detail is 0 (assuming it represents an error or no user found)
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
        user_info: [],
      });
    }
  }

}


exports.get_user_by_id = async (req, res) => {

  const { user_id } = req.body;
  const schema = Joi.alternatives(
    Joi.object({
      user_id: [Joi.number().empty().required()],
    })
  );
  const result = schema.validate(req.body);

  const authHeader = req.headers.authorization;
  const token_1 = authHeader;
  const token = token_1.replace("Bearer ", "");
  const decoded = jwt.decode(token);
  const check_user = await getData("users", `where id= ${decoded.data.id}`);
  const settingshow_me = await getData("setting_show_me", `where user_id= ${decoded.data.id}`);

  if (result.error) {
    const message = result.error.details.map((i) => i.message).join(",");
    return res.json({
      message: result.error.details[0].message,
      error: message,
      missingParams: result.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    const user_detail = await getUser_by_id(user_id);

    if (user_detail !== 0) {
      await Promise.all(
        user_detail.map(async (item) => {

          // if (item.latitude != null && item.latitude != "" && item.longitude != null && item.longitude != "") {
          if (item.latitude != null && item.latitude != "" && item.latitude != undefined && item.longitude != null && item.longitude != "" && item.longitude != undefined) {
            const unit = 'metric';
            const origin = check_user[0]?.latitude + ',' + check_user[0]?.longitude;
            const destination = item.latitude + ',' + item.longitude;
            try {
              const disvalue = await distanceShow(unit, origin, destination);
              if (disvalue.distance) {
                item.distance = disvalue.distance;
              }

            } catch (error) {
              console.error('Error in yourAsyncFunction:', error);
              // Handle errors as needed
            }
          } else {
            item.distance = "0"
          }

          const birthdate = item.DOB;
          const get_age = calculateAge(birthdate);

          const profileimage = await profileimages(user_id);

          if (item.profile_image !== "No image") {
            item.profile_image = baseurl + "/profile/" + item.profile_image;
          }

          if (profileimage?.length > 0) {
            item.images = profileimage.map(imageObj => imageObj.image ? baseurl + '/profile/' + imageObj.image : "");
          } else {
            item.images = [];
          }


          item.age = get_age;

        })
      );

      return res.json({
        status: 200,
        success: true,
        message: "User fetch successful",
        user_info: user_detail,
        distance_status: (settingshow_me[0]?.distance == 1) ? true : false,
      });
    } else {
      // Handle the case where user_detail is 0 (assuming it represents an error or no user found)
      return res.json({
        status: 404,
        success: false,
        message: "User not found",
        user_info: [],
      });
    }
  }

}

exports.block_unblock = async (req, res) => {

  const { user_id, block_status, block_id } = req.body;


  const schema = Joi.alternatives(
    Joi.object({
      user_id: [Joi.number().empty().required()],
      block_status: [Joi.number().empty().required()],
      block_id: [Joi.number().empty().required()]
    })
  );
  const result = schema.validate(req.body);
  if (result.error) {
    const message = result.error.details.map((i) => i.message).join(",");
    return res.json({
      message: result.error.details[0].message,
      error: message,
      missingParams: result.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {

    const get__block_user = await get_block_user(user_id, block_id)

    if (get__block_user.length !== 0) {

      const update_block__user = await block_unblock(user_id, block_id, block_status)
      return res.json({
        success: true,
        status: 200,
        block_status: block_status,
        message: "update block user successfully! "
      })


    } else {
      const data = {
        user_id: user_id,
        block_status: block_status,
        block_id: block_id
      }

      const insert_block_user = await insert_block_unblock(data)
      return res.json({
        success: true,
        status: 200,
        message: "insert block user successfully"
      })
    }



  }
}

exports.get_block_list = async (req, res) => {
  const { user_id } = req.body;
  const schema = Joi.alternatives(
    Joi.object({
      user_id: [Joi.number().empty().required()],
    })
  );
  const result = schema.validate(req.body);
  if (result.error) {
    const message = result.error.details.map((i) => i.message).join(",");
    return res.json({
      message: result.error.details[0].message,
      error: message,
      missingParams: result.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    const get__block__list = await get_block_list(user_id)
    if (get__block__list.length !== 0) {


      await Promise.all(
        get__block__list.map(async (item) => {

          const user_info = await getData("users", `where id= ${item.block_id}`);

          if (user_info.length != 0) {

            if (user_info[0]?.profile_image != "No image") {
              // item.profile_image = baseurl + "/profile/" + item.profile_image;
              user_info[0].profile_image = baseurl + "/profile/" + user_info[0].profile_image;
            }


            item.block_user_info = user_info[0]
          } else {
            item.block_user_info = []
          }

        })
      );
      return res.json({
        success: true,
        status: 200,
        messgae: "list successfully fetched!",
        data: get__block__list
      })
    } else {
      return res.json({
        success: false,
        status: 404,
        message: "no user found!"
      })
    }



  }

}

exports.get_block_by_id = async (req, res) => {
  const { user_id, block_id } = req.body;
  const schema = Joi.alternatives(
    Joi.object({
      user_id: [Joi.number().empty().required()],
      block_id: [Joi.number().empty().required()]

    })
  );
  const result = schema.validate(req.body);
  if (result.error) {
    const message = result.error.details.map((i) => i.message).join(",");
    return res.json({
      message: result.error.details[0].message,
      error: message,
      missingParams: result.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    const get__block__list = await get_block_user_status(user_id, block_id)
    if (get__block__list.length !== 0) {
      return res.json({
        success: true,
        status: 200,
        messgae: "list successfully fetched!",
        data: get__block__list
      })
    } else {
      return res.json({
        success: false,
        status: 404,
        message: "no user found!"
      })
    }



  }

}

exports.add_text = async (req, res) => {
  try {
    const { user_id, text } = req.body;

    const commonSchema = Joi.object({
      user_id: Joi.number().required(),
      text: Joi.string().required(),
    });

    const commonValidationResult = commonSchema.validate({
      user_id,
      text,
    });

    if (commonValidationResult.error) {
      const errorMessage = commonValidationResult.error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.json({
        message: commonValidationResult.error.details[0].message,
        error: errorMessage,
        missingParams: commonValidationResult.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = {
        user_id,
        text,
      };

      const result = await add_text(data);
      if (result !== 0) {
        return res.json({
          success: true,
          status: 200,
          message: "successfully added text",
        });
      } else {
        return res.json({
          success: false,
          status: 400,
          message: "failed to added text",
        });
      }
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

exports.get_text = async (req, res) => {
  try {
    const { user_id } = req.body;

    const commonSchema = Joi.object({
      user_id: Joi.number().required(),
    });

    const commonValidationResult = commonSchema.validate({
      user_id,
    });

    if (commonValidationResult.error) {
      const errorMessage = commonValidationResult.error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.json({
        message: commonValidationResult.error.details[0].message,
        error: errorMessage,
        missingParams: commonValidationResult.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const fetch_texts = await fetch_text(user_id);

      if (fetch_texts !== 0) {
        return res.json({
          success: true,
          status: 200,
          message: "text fetch successsfully!",
          data: fetch_texts,
        });
      } else {
        return res.json({
          success: false,
          status: 400,
          message: "failed to fetch text",
        });
      }
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

exports.delete_text = async (req, res) => {
  try {
    const { user_id, msg_id } = req.body;

    const commonSchema = Joi.object({
      user_id: Joi.number().required(),
      msg_id: Joi.number().required(),
    });

    const commonValidationResult = commonSchema.validate({
      user_id, msg_id
    });

    if (commonValidationResult.error) {
      const errorMessage = commonValidationResult.error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.json({
        message: commonValidationResult.error.details[0].message,
        error: errorMessage,
        missingParams: commonValidationResult.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const deleteText = await delete_text(user_id, msg_id);

      if (deleteText.affectedRows != 0) {
        return res.json({
          success: true,
          status: 200,
          message: "text deleted successsfully!",

        });
      } else {
        return res.json({
          success: false,
          status: 400,
          message: "failed to delete text",
        });
      }
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

exports.submit_report = async (req, res) => {
  try {
    const {
      group_id, comment, sender_id, reciver_id
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        group_id: [Joi.number().empty().optional()],
        comment: [Joi.string().empty().required()],
        sender_id: [Joi.number().empty().required()],
        reciver_id: [Joi.number().empty().optional()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        status: 400,
        success: false,
      });
    } else {
      const userInfo = await fetchUserBy_Id(sender_id);
      if (userInfo.length !== 0) {

        let report_info = {
          reciver_id: reciver_id ? reciver_id : 0,
          sender_id: sender_id,
          comment: comment,
          group_id: group_id ? group_id : 0,
        };
        const result = await insert_report(report_info);
        if (result.affectedRows) {
          return res.json({
            message: " successfully",
            status: 200,
            success: true,
          });
        } else {
          return res.json({
            message: "report submit  failed ",
            status: 200,
            success: false,
          });
        }
      } else {
        return res.json({
          messgae: "user not found",
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

exports.incognito_mode = async (req, res) => {
  try {
    const { user_id, incognito_status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        incognito_status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        let checksub = await checkSubscriptionDetail(user_id);
        if (checksub.id == 6) {


          if (incognito_status == 1) {

            if (check_user[0].incognito_mode == 1) {

              return res.json({
                message: " Incognito mode is already ON ",
                success: true,
                status: 200,
              });

            } else {

              const Update_incognito_status = await update_incognito_status(user_id, incognito_status)

              return res.json({
                message: " Incognito mode  ON",
                success: true,
                status: 200,
              });

            }
          } else if (incognito_status == 0) {

            if (check_user[0].incognito_mode == 0) {
              return res.json({
                message: " Incognito mode is already OFF ",
                success: true,
                status: 200,
              });

            } else {

              const Update_incognito_status = await update_incognito_status(user_id, incognito_status)

              return res.json({
                message: " Incognito mode  OFF ",
                success: true,
                status: 200,
              });

            }
          }
        } else {

          return res.json({
            message: " To use this feature please upgrade to full plan  ",
            success: true,
            status: 200,
          });

        }
      } else {
        return res.json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.privacyPolicy_english_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/English_dark/privacy.html')
});

exports.terms_condition_english_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/English_dark/terms-condition.html');
});

exports.privacyPolicy_french_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/French_dark/politique-de-confidentialite.html')
});

exports.terms_condition_french_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/French_dark/termes-et-conditions.html');
});

exports.privacyPolicy_spanish_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/Spanish_dark/politica-de-privacidad.html')
});

exports.terms_condition_spanish_dark = (async (req, res) => {
  res.sendFile(__dirname + '/view/Spanish_dark/terminos-y-condiciones.html');
});

exports.terms_condition_spanish_light = (async (req, res) => {
  res.sendFile(__dirname + '/view/Spanish_ligth/terminos-y-condiciones.html')
});

exports.privacyPolicy_spanish_light = (async (req, res) => {
  res.sendFile(__dirname + '/view/Spanish_ligth/politica-de-privacidad.html');
});

exports.privacyPolicy_english_ligth = (async (req, res) => {
  res.sendFile(__dirname + '/view/English_ligth/privacy.html')
});

exports.terms_condition_english_ligth = (async (req, res) => {
  res.sendFile(__dirname + '/view/English_ligth/terms-condition.html');
});

exports.privacyPolicy_french_ligth = (async (req, res) => {
  res.sendFile(__dirname + '/view/French_ligth/politique-de-confidentialite.html')
});



exports.terms_condition_french_ligth = (async (req, res) => {
  res.sendFile(__dirname + '/view/French_ligth/termes-et-conditions.html');
});

exports.Updatelatlong = (async (req, res) => {

  try {
    const { latitude, longitude } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        latitude: [Joi.string().empty().required()],
        longitude: [Joi.string().empty().required()]
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      const authHeader = req.headers.authorization;
      const token_1 = authHeader;
      const token = token_1.replace("Bearer ", "");
      const decoded = jwt.decode(token);
      const user_id = decoded.data.id;

      let data = ` latitude = '${latitude}' ,longitude = '${longitude}' `;
      let where = `where id = ${user_id}`;
      const result1 = await updateData("users", where, data);

      if (result1.affectedRows != 0) {
        return res.json({
          success: true,
          status: 200,
          message: "latitude and longitude updated Successfully!",

        });
      } else {
        return res.json({
          success: false,
          status: 400,
          message: "latitude and longitude not updated!",
        });
      }
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

});

exports.chat_notification_mode = async (req, res) => {
  try {
    const { user_id, chat_notification_status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        chat_notification_status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        if (chat_notification_status == 1) {

          if (check_user[0].chat_notification == 1) {

            return res.status(200).json({
              message: " chat_notification is already ON ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_chat_notification_status(user_id, chat_notification_status)

            return res.status(200).json({
              message: " chat_notification mode  ON",
              success: true,
              status: 200,
            });

          }
        } else if (chat_notification_status == 0) {

          if (check_user[0].chat_notification_status == 0) {
            return res.status(200).json({
              message: " chat_notification mode is already OFF ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_chat_notification_status(user_id, chat_notification_status)

            return res.status(200).json({
              message: " chat_notification mode  OFF ",
              success: true,
              status: 200,
            });

          }
        }

      } else {
        return res.status(400).json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.group_notification_mode = async (req, res) => {
  try {
    const { user_id, group_notification_status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        group_notification_status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        if (group_notification_status == 1) {

          if (check_user[0].group_notification == 1) {

            return res.status(200).json({
              message: " group_notification is already ON ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_group_notification_status(user_id, group_notification_status)

            return res.status(200).json({
              message: " group_notification mode  ON",
              success: true,
              status: 200,
            });

          }
        } else if (group_notification_status == 0) {

          if (check_user[0].group_notification == 0) {
            return res.status(200).json({
              message: " group_notification mode is already OFF ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_group_notification_status(user_id, group_notification_status)

            return res.status(200).json({
              message: " group_notification mode  OFF ",
              success: true,
              status: 200,
            });

          }
        }

      } else {
        return res.status(400).json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.taps_notification_mode = async (req, res) => {
  try {
    const { user_id, taps_notification_status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        taps_notification_status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        if (taps_notification_status == 1) {

          if (check_user[0].taps_notification == 1) {

            return res.status(200).json({
              message: " taps_notification	 is already ON ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_tapes_notification_status(user_id, taps_notification_status)

            return res.status(200).json({
              message: " taps_notification	 mode  ON",
              success: true,
              status: 200,
            });

          }
        } else if (taps_notification_status == 0) {

          if (check_user[0].taps_notification == 0) {
            return res.status(200).json({
              message: " taps_notification	 mode is already OFF ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_tapes_notification_status(user_id, taps_notification_status)

            return res.status(200).json({
              message: " taps_notification	 mode  OFF ",
              success: true,
              status: 200,
            });

          }
        }

      } else {
        return res.status(400).json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.dont_disturb_mode = async (req, res) => {
  try {
    const { user_id, dont_disturb } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        dont_disturb: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        if (dont_disturb == 1) {

          if (check_user[0].dont_disturb == 1) {

            return res.status(200).json({
              message: " video_Call_notification	 is already ON ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_dont_disturb_status(user_id, dont_disturb)

            return res.status(200).json({
              message: " dont_disturb	 mode  ON",
              success: true,
              status: 200,
            });

          }
        } else if (dont_disturb == 0) {

          if (check_user[0].dont_disturb == 0) {
            return res.status(200).json({
              message: " dont_disturb	 mode is already OFF ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_dont_disturb_status(user_id, dont_disturb)

            return res.status(200).json({
              message: " dont_disturb	 mode  OFF ",
              success: true,
              status: 200,
            });

          }
        }

      } else {
        return res.status(400).json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.video_call_notification_mode = async (req, res) => {
  try {
    const { user_id, video_call_notification_status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        video_call_notification_status: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.status(400).json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const check_user = await fetchUserById(user_id);


      if (check_user.length != 0) {


        if (video_call_notification_status == 1) {

          if (check_user[0].video_Call_notification == 1) {

            return res.status(200).json({
              message: " video_Call_notification	 is already ON ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_video_call_notification_status(user_id, video_call_notification_status)

            return res.status(200).json({
              message: " video_Call_notification	 mode  ON",
              success: true,
              status: 200,
            });

          }
        } else if (video_call_notification_status == 0) {

          if (check_user[0].video_Call_notification == 0) {
            return res.status(200).json({
              message: " video_Call_notification	 mode is already OFF ",
              success: true,
              status: 200,
            });

          } else {

            const Update_incognito_status = await update_video_call_notification_status(user_id, video_call_notification_status)

            return res.status(200).json({
              message: " video_Call_notification	 mode  OFF ",
              success: true,
              status: 200,
            });

          }
        }

      } else {
        return res.status(400).json({
          message: "User not found please sign-up first",
          success: false,
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};



exports.get_tag = async (req, res) => {
  try {
    const { searchtag } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        searchtag: [Joi.string().allow(null, "").optional(),],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      let search_tag = await filtertags(searchtag);
      if (search_tag.length != 0) {

        return res.json({
          message: "search tag",
          status: 200,
          success: true,
          search_tag: search_tag,

        });
      } else {
        return res.json({
          message: "No data found ",
          status: 400,
          success: false,
        });
      }

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

exports.add_tag = async (req, res) => {
  try {
    const { tags_name } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tags_name: [Joi.string().allow(null, "").optional(),],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const savedData = {
        tag_name: tags_name,
      };
      console.log(">>>>>>>>>>>>>>>>>>saaaaa", savedData);
      let result = await inserttags(savedData);
      if (result.affectedRows > 0) {

        return res.json({
          message: "Insert tag successfully",
          status: 200,
          success: true,
        });
      } else {
        return res.json({
          message: "No insert tag",
          status: 400,
          success: false,
        });
      }

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

exports.markAsSeen = async (req, res) => {
  try {
    const { user_id, notification_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
        notification_id: [Joi.number().empty().required()],

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      await markNotificationAsSeen(user_id, notification_id);

      return res.status(200).json({
        status: 200,
        message: 'Marked As Seen ',
        success: true,
      })

    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.getGames = async (req, res) => {
  try {
    const { game, language } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        game: [Joi.string().empty().required()],
        language: [Joi.string().empty().required()],

      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const data = await fetchRandomData(game, language)

    return res.json({
      data: data[0]
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 200,
      message: 'Internal Server Error',
      success: false,
      error: error
    })

  }

};

exports.markAllSeen = async (req, res) => {
  try {
    const { user_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      await markAllNotificationAsSeen(user_id);

      return res.status(200).json({
        status: 200,
        message: 'Marked As Seen ',
        success: true,
      })

    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};


