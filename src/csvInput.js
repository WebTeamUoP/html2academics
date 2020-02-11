const { csvToJSON } = require('./utils/csv');
const listsToObjects = require('./utils/listsToObjects');
const { readFile, writeJSON } = require('./utils/files');

/**
 * Checks that the object has the only the expected keys and the values are all truthy.
 * @todo Refactor to handle desirable falsy data. Pass a function?
 * @param  { Object } dataItem The properties of the item
 * @param  { Array } attributes The expected attributes
 */
const validateObject = (dataItem, attributes) => {
	const keys = Object.keys(dataItem);

	// Checking the keys - number matches
	if (keys.length !== attributes.length) {
		return false;
	}

	// Checking the keys - name matches
	const keysMatch = keys
		.map((key) => attributes.includes(key))
		.reduce((acc, current) => acc && current, true);
	if (!keysMatch) {
		return false;
	}

	return Object.values(dataItem).reduce((acc, current) => acc && current, true);
};

module.exports = (csvPath) => {
	const [headers, ...data] = csvToJSON(readFile(csvPath));

	const jsonData = listsToObjects(headers, data);

	const validItems = jsonData.filter((object) =>
		validateObject(object, headers)
	);

	const renamedAttributes = validItems.map((item) => {
		const output = {};

		output.name = item['Name variant > Known as name-0'];
		output.email = item['Organisations > Email addresses > Email-2'];
		output.uuid = item['UUID-1'];

		return output;
	});

	console.log(jsonData.length);
	console.log(validItems.length);


	// writeJSON('../../data/rejectedLines.json', rejectedLines);

	return renamedAttributes;
};
