'use strict';

const cheerio = require('cheerio');
const request = require('request');

let Countries = ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Mexico', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'];

const today = new Date();
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

const fs = require('fs');
let JSONData = fs.readFileSync('data/countries.json');
let countriesData = JSON.parse(JSONData);

function dateDiffInDays(a, b) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

request({
    method: 'GET',
    url: 'https://www.worldometers.info/coronavirus'
}, (err, res, body) => {

    if (err) return console.error(err);

    let $ = cheerio.load(body);

	$('div[id="newsdate2020-04-04"]').find('div[class="news_post"]').each(function (i, e) {
		var cases = 0;
		var deaths = 0;
		var report = $(this).find("strong").text();

		Countries.some(function(country, index) {
			if (report.includes(country)) {
				var filtered_report = report.substring(0, report.indexOf(country));
				var numbers = filtered_report.match(/\d+/g).map(Number);
				switch (numbers.length) {
					case 2:
						cases = Number(numbers[0]);
						deaths = Number(numbers[1]);
						console.log('\x1b[36m%s\x1b[0m | \x1b[33m%s\x1b[0m | \x1b[31m%s\x1b[0m', country, 'Cases: ' + cases, 'Deaths: ' + deaths);
						break;
					case 1:
						if (report.includes('new case')) {
							cases = Number(numbers);
							console.log('\x1b[36m%s\x1b[0m | \x1b[33m%s\x1b[0m', country, 'Cases: ' + cases);
						}
						else if (report.includes('new death')) {
							deaths = Number(numbers);
							console.log('\x1b[36m%s\x1b[0m | \x1b[31m%s\x1b[0m', country, 'Deaths: ' + deaths);
						}
						else {
							console.error('Unexpected string in report: ' + report)
						}
						break;
					default:
						console.error('Unexpected figures in report: ' + report)
						break;
				}

				if (cases || deaths) {
					var updated = new Date(countriesData.datasets[index].updated);
					var date_diff = dateDiffInDays(updated, today);
					if ((date_diff < 0) || (date_diff > 1)) {
						console.log('Unexpected difference in dates');
					}
					else {
						if (cases) {
							if (date_diff == 1) {
								countriesData.datasets[index].cases.push(0);
							}

							const length = countriesData.datasets[index].cases.length;
							const sum = countriesData.datasets[index].cases[length - 2] + cases;

							if (sum != countriesData.datasets[index].cases[length - 1]) {
								countriesData.datasets[index].cases[length - 1] = sum;
								console.log('Added ' + cases + ' cases to ' + countriesData.datasets[index].name);
								countriesData.datasets[index].updated = today.toJSON();
							}
						}
						if (deaths) {
							if (date_diff == 1) {
								countriesData.datasets[index].deaths.push(0);
							}

							const length = countriesData.datasets[index].deaths.length;
							const sum = countriesData.datasets[index].deaths[length - 2] + deaths;

							if (sum != countriesData.datasets[index].deaths[length - 1]) {
								countriesData.datasets[index].deaths[length - 1] = sum;
								console.log('Added ' + deaths + ' deaths to ' + countriesData.datasets[index].name);
								countriesData.datasets[index].updated = today.toJSON();
							}
						}
					}
				}
			}
		});
	});

	countriesData.site_updated = today.toJSON();
	var stringify = JSON.stringify(countriesData, null, '\t');
	fs.writeFileSync('data/countries.json',
		stringify.replace(/\s\s\s\s\d+,\n/g, n => n.match(/\d+/g) + ', ')
			.replace(/\[\n\d+/g, n => '[' + n.match(/\d+/g))
			.replace(/\s\s\s\s\d+\n\s\s\s],/g, n => n.match(/\d+/g) + '],'));
});
