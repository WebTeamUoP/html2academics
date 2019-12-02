const fs = require('fs');
const { join } = require('path');

const absFilePath = (relPath) => join(__dirname, relPath);

const readFile = (relPath) => {
	const absPath = absFilePath(relPath);
	return fs.readFileSync(absPath, { encoding: 'utf8' });
};

export const getLocalFile = (fef) => {
	console.log(fef.url);
	const fileData = readFile(fef.url);
	fef.data.fileData = fileData;
	return fef;
};
