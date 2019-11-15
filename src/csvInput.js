const { csvToJSON } = require('./utils/csv');
const listsToObjects = require('./utils/listsToObjects');
const { readFile, writeJSON } = require('./utils/files');

module.exports = (csvPath) => {
	const jsonData = csvToJSON(readFile(csvPath));
	const rejectedLines = [];

	const data = listsToObjects(jsonData[0], jsonData.slice(1)).map(
		(academic) => {
			const publishingString = ' Default publishing name';
			const knownAsString = ' Known as name';

			const uuid = academic['UUID-1'];
			const resolvedData = { uuid };

			academic['Name variant-3'].split(', ').forEach((name) => {
				if (name.includes(publishingString)) {
					resolvedData['publishing'] = name.replace(
						publishingString,
						''
					);
				} else if (name.includes(knownAsString)) {
					resolvedData['knownAs'] = name.replace(knownAsString, '');
				} else resolvedData['unknown'] = name;
			});

			if (
				!(
					resolvedData.uuid &&
					resolvedData.publishing &&
					resolvedData.knownAs
				)
			) {
				console.warn('Academic missing data: ', academic);
				rejectedLines.push(academic);
				return null;
			}

			return resolvedData;
		}
	);

	writeJSON('../../data/rejectedLines.json', rejectedLines);

	return data.filter((academic) => academic);
};
