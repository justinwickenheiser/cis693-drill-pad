module.exports = {


  friendlyName: 'Save',


  description: 'Save editor.',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs) {
    var editor = JSON.parse(this.req.param('editor'));
    var userId = this.req.session.userId;
    var qryExists = await Editor.findOne({publicId: editor.editorId});

    if (qryExists === undefined) {
      // doesn't exist. Insert new record
      var qryInsert = await Editor.create({
        publicId: editor.editorId,
        title: editor.title,
        hashLine: parseInt( editor.settings.hash ),
        userId: userId,
        charts: editor.charts,
        performers: editor.performers
      }).fetch();
      sails.log(qryInsert);
    } else {
      var qryUpdate = await Editor.updateOne({publicId: editor.editorId}).set({
        title: editor.title,
        hashLine: parseInt( editor.settings.hash ),
        charts: editor.charts,
        performers: editor.performers
      });
      sails.log(qryUpdate);
    }
    
    // All done.
    return;

  }


};
