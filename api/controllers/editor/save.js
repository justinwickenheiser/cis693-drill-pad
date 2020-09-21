module.exports = {


  friendlyName: 'Save',


  description: 'Save editor.',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs) {
    var editor = this.req.param('editor');
    var userId = this.req.session.userId;
    console.log(userId);
    var qryExists = await Editor.findOne({publicId: editor.editorId});
    sails.log(qryExists);

    if (qryExists === undefined) {
      // doesn't exist. Insert new record
      var qryInsert = await Editor.create({
        publicId: editor.editorId,
        title: editor.title,
        hashLine: parseInt( editor.settings.hash ),
        userId: userId,
        charts: editor.charts
      }).fetch();
      sails.log(qryInsert);
    } else {
      var qryUpdate = await Editor.updateOne({publicId: editor.editorId}).set({
        title: editor.title,
        hashLine: parseInt( editor.settings.hash ),
        charts: editor.charts
      });
      sails.log(qryUpdate);
    }
    
    
    // All done.
    return;

  }


};
