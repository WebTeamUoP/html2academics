import { csvToJSON } from '../utils/csv';
import listsToObjects from '../utils/listsToObjects';

const extractionMethods = {
	csv: (fileData, fef) => {
		const jsonData = csvToJSON(fileData);
		return listsToObjects(jsonData[0], jsonData.slice(1));
	},
};

export const getData = (fef) => {
	const [debugging, debugOptions] = fef.isDebug();
	let extractedData = extractionMethods[fef.dataType](fef.data.fileData);

	if (debugging && debugOptions && debugOptions.limit) {
		extractedData = extractedData.slice(0, debugOptions.limit);
	}

	fef.data.extractedData = extractedData;
	return fef;
};
