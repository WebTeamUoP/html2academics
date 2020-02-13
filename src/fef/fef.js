import { getLocalFile } from './getFile';
import { getData } from './getData';
import { processData } from './processData';
import checkLinks from './checkLinks';

import { writeJSON } from '../utils/files';

export class Fef {
	constructor(url, dataType, options = {}) {
		this.url = url;
		this.dataType = dataType;
		this.data = {};
		this.options = options;
	}

	saveJSON(relPath, data) {
		writeJSON(relPath, data);
	}

	isDebug() {
		const debug = this.options.debug;
		if (debug) {
			return [true, debug];
		} else {
			return [false, null];
		}
	}

	// Would-be Setters
	setInputFilter(filter) {
		this.inputFilter = filter;
	}

	setItemTransformation(transformation) {
		this.transformation = transformation;
	}

	setPostProcessValidation(validation) {
		this.postProcessValidation = validation;
	}

	// Stages
	getFile() {
		return getLocalFile(this);
	}

	extractDataFromFile() {
		return getData(this);
	}

	process() {
		return processData(this);
	}

	resultValidation() {
		const dataToValidate = this.data.processed;
		const validated = checkLinks(dataToValidate);
		this.data.validated = validated;
		return;
	}

	run() {
		this.getFile();
		this.extractDataFromFile();
		this.process();
		this.resultValidation();
		// console.log('the data: ', this.data.filteredInput.matching);
	}
}
