module.exports = {


  friendlyName: 'View print',


  description: 'Display "Print" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/editor/print'
    }

  },


  fn: async function () {
    var editorId = this.req.param('editorId');
    // Look up the editor by id
    if (editorId !== undefined) {
      var editor = await Editor.findOne({publicId: editorId});
      return {editor: editor};
    } else {
      throw {redirect: '/'};
    }

    // Respond with view.
    return {};
  }


};
