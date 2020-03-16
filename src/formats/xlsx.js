import XLSX from 'xlsx';

export const xlsxToJSON = (data) => {
	const { Sheets, SheetNames } = XLSX.read(data, { type: 'binary' });
	const sheet = Sheets[SheetNames];

	const jsonSheet = XLSX.utils.sheet_to_json(sheet, {
		raw: false,
	});
	console.log(jsonSheet);
	return jsonSheet;
};
export const jsonToXLSX = (data) => {
	/* original data */
	const filename = 'write.xlsx';
	const ws_name = 'SheetJS';

	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.json_to_sheet(data);

	XLSX.utils.book_append_sheet(wb, ws, ws_name);

	XLSX.writeFile(wb, filename);
	return null;
};
