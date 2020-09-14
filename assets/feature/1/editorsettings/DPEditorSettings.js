class DPEditorSettings extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		var dpEditorSettings = this;
		// open the modal
		dpEditor.showUIModal( dpEditorSettings, 'Editor Settings', dpEditorSettings.getFormDom() );
	}

	getFormDom() {
		var dom = $('<div>');
		var p = $('<p>');

		// Editor Title
		$('<label>', {
			'for': 'editorTitle',
			'text': 'Title '
		}).appendTo(p);
		$('<input>', {
			'id': 'editorTitle',
			'type': 'text',
			'value': dpEditor.getTitle()
		}).appendTo(p);
		p.appendTo(dom);
		p = $('<p>');

		// Hash
		$('<label>', {
			'for': 'hash',
			'text': 'Hash Lines'
		}).appendTo(p);
		var select = $('<select>', {
			'id': 'hash'
		}).appendTo(p);
		select.append($('<option>', {
			'value': DP.HASH.COLLEGE,
			'text': 'College',
			'selected': (dpEditor.settings.hash === DP.HASH.COLLEGE ? true : false)
		}));
		select.append($('<option>', {
			'value': DP.HASH.HS,
			'text': 'High School',
			'selected': (dpEditor.settings.hash === DP.HASH.HS ? true : false)
		}));
		p.appendTo(dom);

		dom.append($('<div>', {
			'text': '* indicates a required field',
			'class': 'req'
		}));
		
		return dom;
	}

	saveFormDom(dpEditor) {
		var editorTitle = $('#editorTitle').val(),
			hash = parseInt( $('#hash').val() );

		dpEditor.setTitle(editorTitle);
		dpEditor.settings.hash = hash;
		project.getItem({name: 'field'}).replaceWith( DP.drawField(dpEditor.settings.pps, {hash: hash}) );
	}

}