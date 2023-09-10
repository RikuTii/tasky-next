interface MyWorkerGlobalScope extends ServiceWorkerGlobalScope {
    __WB_DISABLE_DEV_LOGS: boolean;
  }

declare var self: MyWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;

export default null;