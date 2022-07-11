window.process = {
  env: {
    NODE_ENV :'production'
  }
};

((err) => {
  console.error = (msg) => {
    if (msg.includes('Warning: ReactDOM.render is no longer supported')) {
      //Ignore these... TODO: port tests to use createRoot
      return;
    }

    err(msg);
  };
})(console.error)

var context = require.context('./modules', true, /.js$/);
context.keys().forEach(context);
