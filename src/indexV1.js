import { Fef } from './fef/fef';

const processor = new Fef('../../data/in/csv.csv', 'csv');

processor.setInputFilter(
	(academic) =>
		academic['Name variant > Known as name-0'] &&
		academic['UUID-1'] &&
		academic['Organisations > Email addresses > Email-2']
);

processor.setItemTransformation((academic) => {
	const baseURL = 'https://researchportal.port.ac.uk/portal/en/persons/';

	/** Format the name for the URL
	 *
	 * @param {string} name The original name
	 * @returns {string} URL compatible name
	 */
	const deduplicate = (list) => [...new Set(list)].map((str) => str.trim());
	const normaliseAcademicName = (name) =>
		name.replace(/\s/g, '-').toLowerCase();

	const name = academic['Name variant > Known as name-0'];
	const uuid = academic['UUID-1'];
	const emailString = academic['Organisations > Email addresses > Email-2'];
	const email = deduplicate(emailString.toLowerCase().split(', '));

	const url = `${baseURL}${normaliseAcademicName(
		name
	)}(${uuid})/publications.html`;
	return { url, name, uuid, email };
});

processor.run();
