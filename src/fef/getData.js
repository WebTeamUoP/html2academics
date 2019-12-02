import { csvToJSON } from '../utils/csv';
import listsToObjects from '../utils/listsToObjects';

const extractionMethods = {
	csv: (fileData, fef) => {
		const jsonData = csvToJSON(fileData);
		return listsToObjects(jsonData[0], jsonData.slice(1));
	},
};

export const getData = (fef) => {
	const extractedData = extractionMethods[fef.dataType](fef.data.fileData);
	fef.data.extractedData = extractedData;
	return fef;
};
