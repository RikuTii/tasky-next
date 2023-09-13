import { getMessaging, getToken } from "firebase/messaging";
import fireBaseApp from "../context/firebase";

export const retrieveToken = async () => {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(fireBaseApp);
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
          return currentToken;
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      }
    }
  } catch (error) {
    console.log("An error occurred while retrieving token:", error);
  }

  return "";
};
