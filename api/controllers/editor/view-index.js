module.exports = {


  friendlyName: 'View index',


  description: 'Display "Index" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/editor/index'
    }

  },


  fn: async function () {
    var user = await DPUser.findOne({
      id: this.req.session.userId,
    }).populate('editors');
    
    // Respond with view.
    return {user: user};

  }


};
