const cheerio = require('cheerio');
const request = require('request');

let Countries = ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Mexico', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'];

request({
    method: 'GET',
    url: 'https://www.worldometers.info/coronavirus'
}, (err, res, body) => {

    if (err) return console.error(err);

    let $ = cheerio.load(body);
	
	$('div[id="newsdate2020-04-01"]').find('div[class="news_post"]').each(function (i, e) {
		var report = $(this).find("strong").text();
		
		Countries.some(function(country) {
			if (report.includes(country)) {
				console.log(country);

				var numbers = report.match(/\d+/g).map(Number);
				switch (numbers.length) {
					case 2:
						console.log("Cases: " + numbers[0]);
						console.log("Deaths: " + numbers[1]);
						break;
					case 1:
						if (report.includes('new case')) {
							console.log("Cases: " + numbers);
						}
						else if (report.includes('new death')) {
							console.log("Deaths: " + numbers);
						}
						else {
							console.error("Unexpected string in report: " + report)
						}
						break;
					default:
						console.error("Unexpected figures in report: " + report)
						break;
				}
			}
		});
	});
});

/*var fs = require('fs');
fs.writeFile("data/countries.json", countries, function(err) {
  if (err) {
	  console.log(err);
  }
});*/
