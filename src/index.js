const { JSDOM } = require('jsdom');

const { yeahNah } = require('./utils/utils');
const { readFile, writeJSON } = require('./utils/files');
const checkLinks = require('./checkLinks');

// Utils and variables definitions
const academicsFile = '../data/long-data.html';
const baseURL = 'https://researchportal.port.ac.uk/portal/en/persons/';

/** Format the name for the URL
 *
 * @param {string} name The original name
 * @returns {string} URL compatible name
 */
const normaliseAcademicName = (name) => name.replace(/\s/g, '-').toLowerCase();

/** Build the academic's URL
 *
 * @param {Object} academic The academic's info from the file
 * @param { string } academic.name The academic's preferred name
 * @param { string } academic.uuid The ID number generated by PURE
 * @returns { URL } The absolute URL of the academics page
 */
const generateAcademicURL = ({ name, uuid }) =>
	`${baseURL}${normaliseAcademicName(name)}(${uuid})/publications.html`;

/**
 *
 * @param {URL} path The path to the file with the academic data
 */
const extractAcademicsFromFile = (path) => {
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
// END definitions

const named = extractAcademicsFromFile(academicsFile);

console.log('Generating URLs');
const urlsToCheck = named.map((academic) => {
	const url = generateAcademicURL(academic);
	academic.url = url;
	return academic;
});

console.log('Checking URLs');
checkLinks(urlsToCheck);