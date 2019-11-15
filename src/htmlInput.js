const { JSDOM } = require('jsdom');
const { yeahNah } = require('./utils/utils');
const { readFile, writeJSON } = require('./utils/files');

module.exports = (path) => {
	console.log('Loading and parsing HTML ', path);
	const dom = new JSDOM(readFile(path));

	console.log('Finding table rows');

	let tableRows = [...dom.window.document.querySelector('tbody').children];
	console.log('Found table rows');

	const { yeah: namedAcademics = [], nah: unnamedAcademics = [] } = yeahNah(
		(academic) => typeof academic.error === 'undefined',
		tableRows.map((academic) => {
			const name = academic.querySelector('.title');
			const uuid = academic.querySelectorAll('td > span')[1];

			if (name && uuid) {
				return {
					name: name.textContent,
					uuid: uuid.textContent,
				};
			} else {
				return {
					error: 'Academic unnamed',
					uuid: uuid.textContent,
				};
			}
		})
	);

	writeJSON('../data/unnamedAcademics.json', unnamedAcademics);
	console.log('Recorded unnamedAcademics');

	return namedAcademics;
};
