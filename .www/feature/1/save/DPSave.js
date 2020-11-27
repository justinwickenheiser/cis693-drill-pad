class DPSave extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		// make a request to save action
		var CSRF_TOKEN = ''
		var editor = JSON.stringify(dpEditor.getJSON());
		$.ajax({
			url: "/csrfToken"
		}).done(function(res) {
			console.log(res._csrf);
			$.post("/api/v1/editor/save", {
				_csrf: res._csrf,
				editor: editor
			}, function andThen(res) {
				console.log(res);
			});
		});
	}

	deselect() {}
}