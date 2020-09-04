class DPFeature {
	featureId = null;
	title = null;
	icon = null;
	folder = null;
	buttonSetting = "default" // default, active

	constructor(obj, dpEditor) {
		if (obj === undefined) {
			obj = {};
		}
		if (obj.featureId !== undefined) {
			this.setFeatureId(obj.featureId);
		}
		if (obj.title !== undefined) {
			this.setTitle(obj.title);
		}
		if (obj.icon !== undefined) {
			this.setIcon(obj.icon);
		}
		if (obj.folder !== undefined) {
			this.setFolder(obj.folder);
		}
		if (obj.buttonSetting !== undefined) {
			this.setButtonSetting(obj.buttonSetting);
		}
	}

	// FEATUREID
	getFeatureId() {
		return this.featureId;
	}

	// The featureId (val) must be a string w/ a length > 0
	setFeatureId(val) {
		if (typeof(val) === 'string' && val.length > 0) {
			this.featureId = val;
			return true;
		}
		return false;
	}

	// TITLE
	getTitle() {
		return this.title;
	}

	// the title (val) must be a string with a length > 0
	setTitle(val) {
		if (typeof(val) === 'string' && val.trim().length) {
			this.title = val.trim();
			return true;
		}
		return false;
	};

	// ICON
	getIcon() {
		return this.icon;
	};

	// the icon (val) must be a string with a length > 0
	setIcon(val) {
		if (typeof(val) === 'string' && val.trim().length) {
			this.icon = val.trim();
			return true;
		}
		return false;
	};

	// FOLDER
	getFolder() {
		return this.folder;
	};

	// the folder (val) must be a string with a length > 0
	setFolder(val) {
		if (typeof(val) === 'string' && val.trim().length) {
			this.folder = val.trim();
			return true;
		}
		return false;
	};

	// BUTTONSETTING
	getButtonSetting() {
		return this.buttonSetting;
	}
	// The buttonSetting (val) must be a string w/ a length > 0
	setButtonSetting(val) {
		if (typeof(val) === 'string' && val.length > 0) {
			this.buttonSetting = val;
			return true;
		}
		return false;
	}

	// ============================================
	// ================ OnClick ===================
	// This is what happens when the feature button
	// is selected from the toolbar
	// ============================================
	onclick() {
		// Left empty for inheritence.
	}

	// ============================================
	// =============== DeSelect ===================
	// This is what happens when the feature button
	// is de-selected from the toolbar. It will be
	// ran before the next feature's onclick
	// ============================================
	deselect() {
		// Left empty for inheritence.
	}

	// ============================================
	// =============== GetFormDom =================
	// This returns the DOM for the modal.
	// ============================================
	getFormDom() {
		var dom = $('<div>'),
			isRequired = false;

		if (isRequired) {
			dom.append($('<div>', {
				'text': '* indicates a required field',
				'class': 'req'
			}));
		}
		return dom;
	}

	// ============================================
	// =============== SaveFormDom =================
	// This saves the values from the modal.
	// ============================================
	saveFormDom(dpEditor) {
		// Left empty for inheritence.
	}

	// ============================================
	// ============= SetControlDom ================
	// This builds the DOM for the control panel.
	// ============================================
	setControlDom() {
		// Left empty for inheritence.
	}
}