class DPPrint extends DPFeature {
	constructor(obj, dpEditor) {
		super(obj, dpEditor);
	}

	onclick() {
		window.open('/editor/print/'+dpEditor.getEditorId(), '_blank');
	}
}