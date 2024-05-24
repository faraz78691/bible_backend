const express = require("express");
const userController = require("../controller/userController");
const bibleController = require("../controller/bibleController");
const auth = require("../middleware/auth");
const upload_profile = require("../middleware/upload_profile");
const upload_albums = require("../middleware/upload_albums");
const upload_group = require("../middleware/upload_group");


const router = express.Router();


// bible routes started

router.get("/getVersion",auth, bibleController.getBibleVersion);
router.get("/getBooksVersesByID/:version_id",auth, bibleController.getBibleBooksByVersion);
router.post("/getVerses",auth, bibleController.getBibleVerses);
router.post("/saveBibleVerses",auth, bibleController.saveBibleVerses);
router.post("/saveEditedBibleVerses",auth, bibleController.saveEditedBibleVerses);
router.post("/addFriends",auth, bibleController.addFriends);
router.post("/getBibleVersesByKeyword",auth, bibleController.getBibleVersesByKeyword);

router.get("/getBibleVerseOfTheDay",auth, bibleController.getBibleVerseOfTheDay);

router.get("/getPastRandomVerses",auth, bibleController.getPastRandomVerses);
router.get("/getSavedVerses",auth, bibleController.getSavedVerses);
router.get("/getEditedVerses",auth, bibleController.getEditedVerses);
router.get("/getFreidns",auth, bibleController.getFreidns);
router.get("/testaments",auth, bibleController.testament);
router.post("/getChapters",auth, bibleController.getChapters);
router.post("/getBooksByVersion",auth, bibleController.getBooksByVersion);
router.post("/getChaptersNo",auth, bibleController.getChaptersNo);
router.post("/getVerseNo",auth, bibleController.getVerseNo);
router.post("/getshortURl",auth, bibleController.getshortURl);
router.post("/getEditshortURl",auth, bibleController.getEditshortURl);
router.post("/getFullURl", bibleController.getFullURl);
router.post("/getEditFullURl", bibleController.getEditFullURl);



// adminnn apis starts
router.post("/loginAdmin", userController.loginAdmin);
router.get("/getCardTemplate", bibleController.getCardTemplate);
router.get("/getSuggestedLinks", bibleController.getSuggestedLinks);
router.get("/getbanners", bibleController.getbanners);
router.get("/getUsers", bibleController.getUsers);
router.post("/uploadCardTemplate",upload_profile.single("file"), bibleController.uploadCardTemplate);
router.post("/uploadsuggested_links",upload_profile.single("file"), bibleController.uploadsuggested_links);
router.post("/updateBanners", upload_profile.fields([{name: 'sidebar_image', maxCount: 1},{name: 'small_image', maxCount: 1},{name: 'big_image', maxCount: 1}]), bibleController.updateBanners);


router.post("/signUp", userController.signUp); 

router.post("/social_login", userController.social_login);

router.post("/loginUser", userController.loginUser);

router.post("/get_all_users", auth, userController.get_all_users);

router.post("/get_tag", userController.get_tag);

router.post("/add_tag", userController.add_tag);

router.post("/get_all_users_1", auth, userController.get_all_users_1);

router.post("/profile_visit", auth, userController.profile_visit);

router.post("/loginUser_with_phone", userController.loginUser_with_phone);

router.post("/verifyUser", userController.verifyUser);

router.post("/submit_report", userController.submit_report);

router.get("/new_users", auth, userController.new_users);

router.get("/users_nearby", auth, userController.users_nearby);

router.get("/verifyUser/:id", userController.verifyUserEmail);


router.post("/Add_favorites", auth, userController.Add_favorites);

router.post("/my_favorite_users_list", auth, userController.my_favorite_users_list);

router.post("/online_status", auth, userController.online_status);

router.post("/offline_status", auth, userController.offline_status);

router.post("/email_change", auth, userController.email_change);

router.post("/incognito_mode", userController.incognito_mode);


router.post("/change_Password_after_login", auth, userController.change_Password_after_login);

router.post(
  "/forgotPassword__by_email",
  userController.forgotPassword__by_email
);

router.post(
  "/forgotPassword_by_phone_number",
  userController.forgotPassword_by_phone_number
);

router.post(
  "/forgotPassword_otp_match_phone_number",
  userController.forgotPassword_otp_match_phone_number
);

router.post(
  "/forgotPassword_otp_match_email",
  userController.forgotPassword_otp_match_email
);

router.get("/verifyPassword/:token", userController.verifyPassword);

router.post("/changePassword", userController.changePassword);

router.post("/myProfile", auth, userController.myProfile);

router.post("/user_info", userController.user_info);

router.post(
  "/editProfile",
  auth,
  upload_profile.single("file"),
  userController.editProfile
);

router.post(
  "/complete_Profile",
  auth,
  upload_profile.single("file"),
  userController.complete_Profile
);

router.post(
  "/add_Album",
  auth, upload_albums.array("files"),
  userController.add_Album
);
router.post("/myAlbum", userController.myAlbum);

router.post("/deleteAlbum", userController.deleteAlbum);


router.post("/deleteAlbumPhotos", userController.deleteAlbumPhotos);

router.post("/AlbumShare", userController.AlbumShare)

router.post("/group_notification", userController.group_notification)

router.post("/Allnotification", userController.Allnotification)

router.post("/get_profile_visit", userController.get_profile_visit)

router.post("/accept_reject_group_invite", userController.accept_reject_group_invite)


router.post(
  "/uploadAlbum",
  auth,
  upload_albums.array("files"),
  userController.uploadAlbum
);

router.post("/myAlbumbyId", userController.myAlbumbyId);

router.post("/editAlbum", auth, upload_albums.array("files"), userController.editAlbum);
//editAlbum

router.post("/myAlbumSharing", auth, userController.myAlbumSharing);



router.post("/myAlbumbyIdsingle", userController.myAlbumbyIdsingle);


router.post("/delete_User", userController.delete_User);


router.post("/Createchatgroup", auth, upload_group.single("file"), userController.Createchatgroup);


router.post("/groupchatByid", auth, userController.groupchatByid);


router.post("/appVerification", auth, upload_profile.single("file"), userController.appVerification);


router.post(
  "/addProfileimages",
  auth,
  upload_profile.array("files"),
  userController.addProfileimages
);
// 
router.post("/changePasswordbefore", userController.changePasswordbefore);

router.post("/get_user", userController.get_user_by_id)

router.post("/allShowme", auth, userController.allShowme);

router.post("/addShowme", auth, userController.addShowme);

router.post("/send_notification", auth, userController.send_notification);

router.get("/privacyPolicy_english_dark", userController.privacyPolicy_english_dark);

router.get("/terms_condition_english_dark", userController.terms_condition_english_dark);

router.get("/privacyPolicy_english_ligth", userController.privacyPolicy_english_ligth);

router.get("/terms_condition_english_ligth", userController.terms_condition_english_ligth);

router.get("/privacyPolicy_french_dark", userController.privacyPolicy_french_dark);

router.get("/terms_condition_french_dark", userController.terms_condition_french_dark);

router.get("/privacyPolicy_french_ligth", userController.privacyPolicy_french_ligth);

router.get("/terms_condition_french_dark", userController.terms_condition_french_ligth);

router.get("/privacyPolicy_spanish_dark", userController.privacyPolicy_spanish_dark); //pp

router.get("/privacyPolicy_spanish_light", userController.privacyPolicy_spanish_light); //tc

router.get("/terms_condition_spanish_dark", userController.terms_condition_spanish_dark); //tc

router.get("/terms_condition_spanish_light", userController.terms_condition_spanish_light); //pp


router.get("/maps", userController.maps);


router.post("/block_unblock", userController.block_unblock)
router.post("/get_block_list", userController.get_block_list)
router.post("/get_block_by_id", userController.get_block_by_id)

router.post("/add_text", userController.add_text)
router.post("/get_text", userController.get_text)
router.post("/delete_text", userController.delete_text)

router.post("/getGroupRequest", userController.getGroupRequest);
router.post("/Updatelatlong", userController.Updatelatlong);

router.post("/chat_notification_mode", userController.chat_notification_mode);
router.post("/group_notification_mode", userController.group_notification_mode);
router.post("/taps_notification_mode", userController.taps_notification_mode);
router.post("/video_call_notification_mode", userController.video_call_notification_mode);
router.post("/dont_disturb_mode", userController.dont_disturb_mode);

// /25/4

router.patch("/mark_seen", userController.markAsSeen);

router.post("/getGames", userController.getGames);

router.post("/allSeen", userController.markAllSeen)

module.exports = router;
