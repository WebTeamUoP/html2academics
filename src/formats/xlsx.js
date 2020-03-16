import XLSX from 'xlsx';

export const xlsxToJSON = (data) => {
	const {Sheets, SheetNames} = XLSX.read(data, { type: 'binary'});
	const sheet = Sheets[SheetNames];

	const jsonSheet = XLSX.utils.sheet_to_json(sheet, {
		raw: false,
	});
	console.log(jsonSheet);
	return jsonSheet;
};
export const jsonToXLSX = () => {};