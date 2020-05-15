'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const d3 = require('d3');
const git = require('simple-git');
const request = require('request');

const today = new Date();
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

let Countries = ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Mexico', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'];
let JSONData = fs.readFileSync('data/countries.json');
let countriesData = JSON.parse(JSONData);
var realtimeData = [];

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

request({
    method: 'GET',
    url: 'https://www.worldometers.info/coronavirus'
}, (err, res, body) => {

    if (err) return console.error(err);

    let $ = cheerio.load(body);

    $('table[id="main_table_countries_today"] > tbody > tr').each((index, element) => {
      let arr = $(element).find('td').toArray().map((x) => { return $(x).text()});

      var indexOf = Countries.indexOf(arr[0]);
      if (indexOf != -1) {
        realtimeData.push({name: arr[0], cases: parseInt(arr[1].replace(/,/g, ''), 10), deaths: parseInt(arr[3].replace(/,/g, ''), 10), tests: parseInt(arr[10].replace(/,/g, ''), 10)});
      }
    });

    realtimeData
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(e => console.log('\x1b[36m%s\x1b[0m | \x1b[33m%s\x1b[0m | \x1b[31m%s\x1b[0m', e.name, 'Cases: ' + e.cases, 'Deaths: ' + e.deaths));

    git()
      .submoduleUpdate(['--remote']);

    const casesData = fs.readFileSync('COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', 'utf8');
    const deathsData = fs.readFileSync('COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv', 'utf8');
    var hasAnyCountryUpdated = false;

    if (casesData) {
      var csvData = d3.csvParse(casesData);
      csvData.forEach(function(country, index) {
        var indexOf = Countries.indexOf(country['Country/Region'])
        if (indexOf != -1) {
          var dailyData = d3.map(country, function(d){ return(d.group) }).values().slice(4); // Trim all data until dates begin
          dailyData = dailyData.map(Number).filter(Number); // Convert to numbers & discard zeroes

          // PARCHES

          // La tabla oficial de John Hopkins tiene un error en los datos, falta un reporte. Este parche lo corrige según datos del gobierno de Argentina.
          if (country['Country/Region'] == 'Argentina') {
            dailyData[21] = dailyData[20];
            dailyData[20] = dailyData[19];
            dailyData[19] = 225;
            dailyData[28] = 966;
            dailyData[32] = 1353;
            dailyData[38] = 1894;
          }
          else if (country['Country/Region'] == 'Ecuador') {
            dailyData[37] = 3995;
          }

          if (realtimeData[indexOf]) {
            if (dailyData[dailyData.length - 1] < realtimeData[indexOf].cases) {
              //console.log('Adding realtime data for ' + realtimeData[indexOf].name + ': ' + realtimeData[indexOf].cases + ' cases');
              dailyData.push(realtimeData[indexOf].cases);
            }

            if (!arraysEqual(countriesData.datasets[indexOf].cases, dailyData)) {
              console.log('Updating cases for ' + realtimeData[indexOf].name + '...');
              countriesData.datasets[indexOf].cases = dailyData;
              countriesData.datasets[indexOf].updated = today.toJSON();
              hasAnyCountryUpdated = true;
            }

            if (countriesData.datasets[indexOf].tests != realtimeData[indexOf].tests) {
              console.log('Updating tests for ' + realtimeData[indexOf].name + '...');
              countriesData.datasets[indexOf].tests = realtimeData[indexOf].tests;
              countriesData.datasets[indexOf].updated = today.toJSON();
              hasAnyCountryUpdated = true;
            }
          }
          else {
            console.log('No realtime data for ' + indexOf + '...');
          }
        }
      });
    }

    if (deathsData) {
      var csvData = d3.csvParse(deathsData);
      csvData.forEach(function(country, index) {
        var indexOf = Countries.indexOf(country['Country/Region'])
        if (indexOf != -1) {
          var dailyData = d3.map(country, function(d){ return(d.group) }).values().slice(4); // Trim all data until dates begin
          dailyData = dailyData.map(Number).filter(Number); // Convert to numbers & discard zeroes

          if (country['Country/Region'] == 'Ecuador') {
            dailyData[24] = 220;
          }

          if (realtimeData[indexOf]) {
            if (dailyData[dailyData.length - 1] < realtimeData[indexOf].deaths) {
              //console.log('Adding realtime data for ' + realtimeData[indexOf].name + ': ' + realtimeData[indexOf].deaths + ' deaths');
              dailyData.push(realtimeData[indexOf].deaths);
            }

            if (!arraysEqual(countriesData.datasets[indexOf].deaths, dailyData)) {
              console.log('Updating deaths for ' + realtimeData[indexOf].name + '...');
              countriesData.datasets[indexOf].deaths = dailyData;
              countriesData.datasets[indexOf].updated = today.toJSON();
              hasAnyCountryUpdated = true;
            }
          }
          else {
            console.log('No realtime data for ' + indexOf + '...');
          }
        }
      });
    }

    if (hasAnyCountryUpdated) {
      countriesData.site_updated = today.toJSON();
      var stringify = JSON.stringify(countriesData, null, '\t');
      fs.writeFileSync('data/countries.json',
        stringify.replace(/\s\s\s\s\d+,\n/g, n => n.match(/\d+/g) + ', ')
          .replace(/\[\n\d+/g, n => '[' + n.match(/\d+/g))
          .replace(/\s\s\s\s\d+\n\s\s\s],/g, n => n.match(/\d+/g) + '],'));

      git()
        .add('./data/countries.json')
        .add('./COVID-19')
        .commit("Actualización de datos")
        .push('origin', 'master', {'--recurse-submodules': 'check'});
    }
  });
