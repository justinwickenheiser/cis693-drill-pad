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
    var isNew = true;
    var editor = {
      editorId: null,
      title: '',
      settings: {
        hash: null
      },
      charts:[]
    };
    // Look up the editor by id
    if (editorId !== undefined) {
      editor = await Editor.findOne({publicId: editorId});
      sails.log(editor)
      isNew = false;
    }
    
    

    // Respond with view.
    return {isNew: isNew, editor: editor};

  }


};
