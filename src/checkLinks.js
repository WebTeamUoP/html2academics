const axios = require('axios');

const { chunks } = require('./utils/karataev');
const { yeahNah } = require('./utils/utils');
const { writeJSON } = require('./utils/files');

const extractResponseData = (academic, response) => {
	let { url } = academic;
	let { status, statusText, request } = response;
	const { path } = request;

	if (url.replace('https://researchportal.port.ac.uk', '') !== path) {
		status = 301;
		statusText = 'Has been redirected';
	}

	const linkData = { url, status, statusText, path };
	academic.linkData = linkData;

	return academic;
};

const requestURL = (academic, instance) =>
	instance
		.head(academic.url)
		.then((response) => extractResponseData(academic, response))
		// .catch(({ response }) => extractResponseData(url, response));
		.catch(({ message }) => ({ academic, error: message }));

const instance = axios.create();

const checkLinks = (academics) =>
	chunks(academics, (academic) => requestURL(academic, instance)).then(
		(output) => {
			// console.log(output);

			const {
				yeah: foundAcademics = [],
				nah: missingAcademics = [],
			} = yeahNah(
				(academic) => typeof academic.error === 'undefined',
				output
			);

			writeJSON('../data/foundAcademics.json', foundAcademics);
			writeJSON('../data/missingAcademics.json', missingAcademics);

			const exportAcademics = foundAcademics.map(({ name, url }) => ({
				name,
				url,
			}));
			console.log('exportAcademics: ', exportAcademics);
			writeJSON('../data/academics.json', exportAcademics);
		}
	);

module.exports = checkLinks;
