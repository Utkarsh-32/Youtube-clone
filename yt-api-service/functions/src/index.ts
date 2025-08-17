import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = getFirestore();
const storage = new Storage();

const rawVideoBucketName = "ut12-yt-raw-videos";

export const createUser = functions.auth.user().onCreate(async (user) => {
  const userInfo = {
    uid: user.uid ?? null,
    email: user.email ?? null,
    photoUrl: user.photoURL ?? null,
  };
  try {
    await firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  } catch (error) {
    logger.error("Error:", error);
  }
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated"
    );
  }
  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });
  return {url, fileName};
});
