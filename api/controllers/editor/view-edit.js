module.exports = {


  friendlyName: 'View edit',


  description: 'Display "Edit" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/editor/edit'
    }

  },


  fn: async function () {
    var editorId = this.req.param('editorId');
    var editor = {
      isNew: true,
      editorId: null,
      title: '',
      settings: {
        hash: null
      },
      charts:[],
      performers:[],
    };
    // Look up the editor by id
    if (editorId !== undefined) {
      editor = await Editor.findOne({publicId: editorId});
      editor.isNew = false;
    }
sails.log(process.env.DATABASE_URL);
sails.log(sails_database_url);
    // Respond with view.
    return {editor: editor};

  }


};
