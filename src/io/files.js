const fs = require('fs');
const { join } = require('path');

const absFilePath = (relPath) => join(__dirname, relPath);

export const getLocalFile = (url) =>
	new Promise((resolve, reject) => {
		const absURL = absFilePath(url);
		console.log('Fetching from this path: ', absURL);

		// TODO support binary files. Like this function but remove UTF-8 argument
		fs.readFile(absURL, 'utf-8', (err, data) => {
			if (err) {
				console.error('Issue getting the file:');
				reject(err);
			}

			resolve(data);
		});
	});

const writeFile = (relPath, data) => {
	fs.writeFile(absFilePath(relPath), data, (err) => {
		if (err) throw err;
		console.log('Saved!', relPath);
	});
};

export const saveLocalFile = (exportableData, outputPath) => {
	writeFile(outputPath, exportableData);
};

export const writeJSON = (relPath, data) =>
	writeFile(relPath, JSON.stringify(data));
