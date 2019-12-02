import { yeahNah } from '../utils/utils';

export const processData = (fef) => {
	console.log(
		`There are ${fef.data.extractedData.length} items from the file`
	);

	const { yeah: namedAcademics = [], nah: unnamedAcademics = [] } = yeahNah(
		fef.inputFilter,
		fef.data.extractedData
	);

	fef.data.filteredInput = {
		matching: namedAcademics,
		nonMatching: unnamedAcademics,
	};

	fef.saveJSON('../../data/out/email/namedAcademics.json', namedAcademics);
	fef.saveJSON(
		'../../data/out/email/unnamedAcademics.json',
		unnamedAcademics
	);

	console.log(`There are ${namedAcademics.length} items matching the filter`);
	console.log(
		`There are ${unnamedAcademics.length} items that don't match the filter`
	);

	const processedData = namedAcademics.map(fef.transformation);
	fef.data.processed = processedData;

	fef.saveJSON('../../data/out/email/processedData.json', processedData);

	return fef;
};
