import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAUBuqDuV8xNfRTSLLB5qRlengFyhzBFL0",
  authDomain: "betasource-broadcast.firebaseapp.com",
  projectId: "betasource-broadcast",
  storageBucket: "betasource-broadcast.firebasestorage.app",
  messagingSenderId: "12449902499",
  appId: "1:12449902499:web:c2c8bd22fdc4f91cfc7416",
  measurementId: "G-CN0NNXGPY1"
};

const app = initializeApp(firebaseConfig);

let messaging = null;
const messagingReady = isSupported()
  .then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
    return messaging;
  })
  .catch((err) => {
    console.error('Firebase: Messaging initialization failed.', err);
    return null;
  });

export { messaging };

export const requestForToken = async () => {
  const vapidKey = "BAjk2czxYcmVqGl_csvea95wCI-sFjNcobaJoRGhUnLm_7X375JUBIQzpi2MmMyNsgK-o-FWTI8cD8jgu3UcUTk";
  try {
    const activeMessaging = await messagingReady;
    if (!activeMessaging) {
      return null;
    }
    const currentToken = await getToken(activeMessaging, { vapidKey });
    if (currentToken) {
      return currentToken;
    } else {
      return null;
    }
  } catch (err) {
    console.error('FCM: Error retrieving device token.', err);
    return null;
  }
};

export const setupForegroundListener = (callback) => {
  let unsubscribe = () => {};
  messagingReady.then((activeMessaging) => {
    if (activeMessaging) {
      unsubscribe = onMessage(activeMessaging, (payload) => {
        callback(payload);
      });
    }
  });
  return () => unsubscribe();
};

export default app;
