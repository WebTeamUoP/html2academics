import { getLocalFile, saveLocalFile, writeJSON } from '../io/files';
import { getFromBrowser, saveToDevice } from '../io/browser';
import { extractData, setData, mimes, readAsBinary } from '../formats/getData';
import { processData } from './processData';

export class Fef {
	constructor(url, dataType, options = {}) {
		this.url = url;
		this.dataType = dataType;
		this.data = {};
		this.options = options;
		this.mime = mimes[dataType] || undefined;
		this.supportedMimes = mimes;

		if (typeof this.mime === 'undefined') {
			console.warn(`This format ${dataType} doesn't have a mime.`);
		}
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
	setInputPreparation(filter) {
		this.inputPreparation = filter;
	}

	setItemTransformation(transformation) {
		this.transformation = transformation;
	}

	setPostProcessValidation(validation) {
		this.postProcessValidation = validation;
	}

	// Stages
	getFile() {
		// TODO Add support for remote files
		const isBinary = readAsBinary.includes(this.dataType) ? true : false;
		if (this.url.startsWith('#')) {
			return getFromBrowser(this.url, isBinary).catch((err) => {
				throw err;
			});
		}
		return getLocalFile(this.url, readAsBinary).catch((err) => {
			throw err;
		});
	}

	extractDataFromFile(data, fef) {
		const extractedData = extractData(data, fef.dataType, ...fef.isDebug());
		fef.data.extractedData = extractedData;
		return fef;
	}

	process(fef) {
		return processData(fef);
	}

	validate(fef) {
		if (typeof fef.postProcessValidation !== 'undefined') {
			const dataToValidate = fef.data.processed;
			const validated = fef.postProcessValidation(dataToValidate);
			return validated.then((valid) => {
				fef.data.validated = valid;
				return fef;
			});
		}
		return fef;
	}

	save(format, outputPath, fef) {
		const { data } = fef;
		const dataToSave = data.validated ? data.validated : data.processed;
		const exportableData = setData(format, dataToSave);

		// Null indicates the conversion library handles the file writing step
		if (exportableData) {
			if (fef.options.platform === 'browser') {
				saveToDevice(
					exportableData,
					outputPath,
					fef.mime,
					fef.options.browser.downloadLinkElem,
					fef.options.browser.displayDownloadLink
				);
			} else {
				saveLocalFile(exportableData, outputPath);
			}
		}

		return fef;
	}

	run(outputPath, format) {
		this.getFile()
			.then((data) => this.extractDataFromFile(data, this))
			.then(() => this.process(this))
			.then(() => this.validate(this))
			.then(() => this.save(format, outputPath, this))
			.then((x) => console.log('from process: ', x))
			.catch((err) => console.error(err));
	}
}
