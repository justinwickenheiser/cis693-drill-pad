module.exports = {


  friendlyName: 'View manual',


  description: 'Display "Manual" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/reference/manual'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
