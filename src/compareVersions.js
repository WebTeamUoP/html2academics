const { readFile, writeJSON } = require('./utils/files');

const file1Name = '../../data/v3/academics.json';
const file2Name = '../../data/academics.json';

const file1Data = JSON.parse(readFile(file1Name));
const file1URLs = file1Data.map((academic) => academic.url);

const file2Data = JSON.parse(readFile(file2Name));
const file2URLs = file2Data.map((academic) => academic.url);

console.log(`The first file has ${file1Data.length} items`);
console.log(`The second file has ${file2Data.length} items`);

const both = file1Data.filter((academic) => file2URLs.includes(academic.url));
const firstOnly = file1Data.filter(
	(academic) => !file2URLs.includes(academic.url)
);
const secondOnly = file2Data.filter(
	(academic) => !file1URLs.includes(academic.url)
);
console.log(`Items in both: ${both.length}`);
console.log(`Items only in the first: ${firstOnly.length}`);
console.log(`Items only in the second: ${secondOnly.length}`);

writeJSON('../../data/comparisons/both.json', both);
writeJSON('../../data/comparisons/firstOnly.json', firstOnly);
writeJSON('../../data/comparisons/secondOnly.json', secondOnly);
