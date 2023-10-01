interface MyWorkerGlobalScope extends ServiceWorkerGlobalScope {
    __WB_DISABLE_DEV_LOGS: boolean;
  }
importScripts("/firebase-messaging-sw.js");


declare var self: MyWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;


export default null;