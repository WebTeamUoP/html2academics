const yeahNah = (condition, data) => {
	console.log('Checking items in list ', data);

	const yeah = [];
	const nah = [];
	data.forEach((element) => {
		if (condition(element)) {
			yeah.push(element);
		} else {
			nah.push(element);
		}
	});
	console.log('Checked items in list ');
	return { yeah, nah };
};

module.exports = {
	yeahNah,
};
