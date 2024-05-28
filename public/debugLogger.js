if (typeof window !== "undefined") {
  if(! window.error_handler_installed) {
    window.error_handler_logs = [];

    const handler = ((old) => ({
      get: (_, name) => {
        function passf() {
          old[name].apply(null, arguments);
        }

        function logf() {
          window.error_handler_logs.push({
            type: name,
            ts: +new Date,
            arguments,
          });
          passf.apply(null, arguments);
        }

        switch (name) {
          case 'log':
          case 'debug':
          case 'info':
          case 'warn':
          case 'error':
            return logf;
          default:
            return passf;
        }
      }
    }))(window.console);
    window.console = new Proxy({}, handler);

    window.addEventListener("error", (e) => {
      const errorDetails = {
        message: e.error?.message || e.message || 'Unknown error',
        stack: e.error?.stack || 'No stack trace available',
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        timeStamp: e.timeStamp,
        type: 'error',
      };
      window.error_handler_logs.push(errorDetails);
      console.error(`Error occurred: ${errorDetails.message}\nStack: ${errorDetails.stack}\nFilename: ${errorDetails.filename}:${errorDetails.lineno}:${errorDetails.colno}\nTime: ${new Date(errorDetails.timeStamp)}`);
      return false;
    });

    window.addEventListener("unhandledrejection", (e) => {
      const errorDetails = {
        message: e.reason?.message || e.message || 'Unhandled promise rejection',
        stack: e.reason?.stack || 'No stack trace available',
        reason: e.reason,
        timeStamp: e.timeStamp,
        type: 'unhandledrejection',
      };
      window.error_handler_logs.push(errorDetails);
      console.error(`Unhandled rejection: ${errorDetails.message}\nStack: ${errorDetails.stack}\nReason: ${errorDetails.reason}\nTime: ${new Date(errorDetails.timeStamp)}`);
      return false;
    });
    
    window.error_handler_installed = true;
  }
}
