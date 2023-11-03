if (typeof window !== "undefined") {
  if(! window.error_handler_installed) {
    window.error_handler_logs = [];

    const cons = ((old) => ({
      log: function() {
        window.error_handler_logs.push({ type: 'log', ts: +new Date, arguments });
        old.log.apply(null, arguments);
      },
      info: function() {
        window.error_handler_logs.push({ type: 'info', ts: +new Date, arguments });
        old.info.apply(null, arguments);
      },
      warn: function() {
        window.error_handler_logs.push({ type: 'warn', ts: +new Date, arguments });
        old.warn.apply(null, arguments);
      },
      error: function() {
        window.error_handler_logs.push({ type: 'error', ts: +new Date, arguments });
        old.error.apply(null, arguments);
      },
      time: function() {
        old.time.apply(null, arguments);
      },
      timeEnd: function() {
        old.timeEnd.apply(null, arguments);
      },
    }))(window.console);
    window.console = cons;

    window.addEventListener("error", (e) => {
      console.error("Error occurred: " + e.error.message);
      return false;
    });

    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled rejection occurred: " + e.reason.message);
      return false;
    });

    window.error_handler_installed = true;
  }
}
