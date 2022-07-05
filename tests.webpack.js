window.process = {
  env: {
    NODE_ENV :'production'
  }
};

var context = require.context('./modules', true, /.js$/);
context.keys().forEach(context);
