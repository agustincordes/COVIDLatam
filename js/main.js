function makeCases(data) {
  var chart = new Chart('cases', {
    type: "line",
    data: {
      labels: Array.from({length: data[2].cases.length}, (v, k) => k + 1), // Ugly hardcode
    },
    options: {
        maintainAspectRatio: false,
        //aspectRatio: 0.4,
        responsive: true,
        /*title: {
          display: true,
          text: 'EVOLUCION DE CASOS',
          fontColor: '#f8f9fa',
          fontSize: 16
        },*/
        tooltips: {
          mode: 'point',
          intersect: false,
          backgroundColor: 'rgba(28, 28, 28, 0.9)'
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Días',
              fontColor: '#f8f9fa',
              fontSize: 16
            },
            gridLines: {
              display:false
            },
            ticks: {
              userCallback: function(value, index) {
                if (index % 2) return "";
                return value;
              }
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Casos',
              fontColor: '#f8f9fa',
              fontSize: 16
            }
          }]
        }
      }
  });

  for (var i = 0; i < data.length; i++) {
    var newDataset = {
      label: data[i].name,
      data: data[i].cases,
      borderColor: data[i].color,
      backgroundColor: data[i].color,
      fill: false
    };

    chart.data.datasets.push(newDataset);
    chart.update();
  }
}

function makeDeaths(data) {
  var chart = new Chart('deaths', {
    type: "line",
    data: {
      labels: Array.from({length: data[0].deaths.length}, (v, k) => k + 1), // Ugly hardcode
    },
    options: {
        maintainAspectRatio: false,
        //aspectRatio: 0.4,
        responsive: true,
        /*title: {
          display: true,
          text: 'EVOLUCION DE DECESOS',
          fontColor: '#f8f9fa',
          fontSize: 16
        },*/
        tooltips: {
          mode: 'point',
          intersect: false,
          backgroundColor: 'rgba(28, 28, 28, 0.9)'
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Días',
              fontColor: '#f8f9fa',
              fontSize: 16
            },
            gridLines: {
              display:false
            },
            ticks: {
              userCallback: function(value, index) {
                if (index % 2) return "";
                return value;
              }
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Decesos',
              fontColor: '#f8f9fa',
              fontSize: 16
            }
          }]
        }
      }
  });

  for (var i = 0; i < data.length; i++) {
    var newDataset = {
      label: data[i].name,
      data: data[i].deaths,
      borderColor: data[i].color,
      backgroundColor: data[i].color,
      fill: false
    };

    chart.data.datasets.push(newDataset);
    chart.update();
  }
}

function makeTotal(data) {
  // Ordenamos los países de mayor a menor caso
  data.sort((a, b) => a.cases.slice(-1)[0] < b.cases.slice(-1)[0] ? 1 : -1);

  // Filtramos los datos en arrays separados para Chart.js
  const countryLabels = data.map(d => d.name);
  const filteredCases = data.map(d => d.cases[d.cases.length - 1]);
  const filteredColors = data.map(d => d.color);

  var chart = new Chart('total', {
    type: "horizontalBar",
    options: {
      maintainAspectRatio: true,
      aspectRatio: 1,
      responsive: true,
      title: {
          display: true,
          text: 'CASOS TOTALES',
          fontColor: '#f8f9fa',
          fontSize: 16
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgba(28, 28, 28, 0.9)'
      }
    },
    data: {
      labels: countryLabels,
      datasets: [
        {
          data: filteredCases,
          backgroundColor: filteredColors
        }
      ]
    }
  });
}

function makeCapita(data) {
  // Calculamos los casos per capita y ordenamos de mayor a menor caso
  const filteredData = data
    .map((obj, idx) => ({ ...obj, capita: (obj.cases[obj.cases.length - 1] / obj.population) * 1000000 }))
    .sort((a, b) => a.capita < b.capita ? 1 : -1);

  // Filtramos los datos en arrays separados para Chart.js
  const countryLabels = filteredData.map(d => d.name);
  const filteredCases = filteredData.map(d => d.capita.toFixed(2));
  const filteredColors = filteredData.map(d => d.color);

  var chart = new Chart('capita', {
    type: "bar",
    options: {
      maintainAspectRatio: true,
      aspectRatio: 1,
      responsive: true,
      title: {
          display: true,
          text: 'CASOS POR MILLON DE HABITANTES',
          fontColor: '#f8f9fa',
          fontSize: 16
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgba(28, 28, 28, 0.9)'
      }
    },
    data: {
      labels: countryLabels,
      datasets: [
        {
          data: filteredCases,
          backgroundColor: filteredColors
        }
      ]
    }
  });
}

function makeDeathsTotal(data) {
  // Ordenamos los países de mayor a menor caso
  data.sort((a, b) => a.deaths.slice(-1)[0] < b.deaths.slice(-1)[0] ? 1 : -1);

  // Filtramos los datos en arrays separados para Chart.js
  const countryLabels = data.map(d => d.name);
  const filteredDeaths = data.map(d => d.deaths[d.deaths.length - 1]);
  const filteredColors = data.map(d => d.color);

  var chart = new Chart('deaths_total', {
    type: "horizontalBar",
    options: {
      maintainAspectRatio: true,
      aspectRatio: 1,
      responsive: true,
      title: {
          display: true,
          text: 'DECESOS TOTALES',
          fontColor: '#f8f9fa',
          fontSize: 16
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgba(28, 28, 28, 0.9)'
      }
    },
    data: {
      labels: countryLabels,
      datasets: [
        {
          data: filteredDeaths,
          backgroundColor: filteredColors
        }
      ]
    }
  });
}

function makeDeathsCapita(data) {
  // Calculamos los casos per capita y ordenamos de mayor a menor caso
  const filteredData = data
    .map((obj, idx) => ({ ...obj, capita: (obj.deaths[obj.deaths.length - 1] / obj.population) * 1000000 }))
    .sort((a, b) => a.capita < b.capita ? 1 : -1);

  // Filtramos los datos en arrays separados para Chart.js
  const countryLabels = filteredData.map(d => d.name);
  const filteredDeaths = filteredData.map(d => d.capita.toFixed(2));
  const filteredColors = filteredData.map(d => d.color);

  var chart = new Chart('deaths_capita', {
    type: "bar",
    options: {
      maintainAspectRatio: true,
      aspectRatio: 1,
      responsive: true,
      title: {
          display: true,
          text: 'DECESOS POR MILLON DE HABITANTES',
          fontColor: '#f8f9fa',
          fontSize: 16
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: 'rgba(28, 28, 28, 0.9)'
      }
    },
    data: {
      labels: countryLabels,
      datasets: [
        {
          data: filteredDeaths,
          backgroundColor: filteredColors
        }
      ]
    }
  });
}

function makeTests(data) {
  var tableRef = document.getElementById('tests-table').getElementsByTagName('tbody')[0];

  data.sort((a, b) => a.name.localeCompare(b.name));

  for (var i = 0; i < data.length; i++) {
    var newRow = tableRef.insertRow();

    var newCell = newRow.insertCell();
    newCell.innerHTML = '<strong style="color: ' + data[i].color + '">' + data[i].name + '</strong>';

    var newCell = newRow.insertCell();
    newCell.innerHTML = data[i].tests.toLocaleString('es-AR');

    var newCell = newRow.insertCell();
    newCell.innerHTML = Math.round((data[i].tests / data[i].population) * 1000000);

    var newCell = newRow.insertCell();
    var percent = Math.ceil((data[i].cases[data[i].cases.length - 1] / data[i].tests) * 100);

    if (percent <= 15) {
      newCell.innerHTML = '<strong style="color: #66FF66">' + percent + '%</strong>';
    }
    else if (percent > 15 && percent < 30) {
      newCell.innerHTML = '<strong style="color: #FFFF66">' + percent + '%</strong>';
    }
    else {
      newCell.innerHTML = '<strong style="color: #FF355E">' + percent + '%</strong>';
    }
  }
}

function loadJSON(callback) {
  var xobj = new XMLHttpRequest();

  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'data/countries.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

loadJSON(function(response) {
  var countries = JSON.parse(response);

  Chart.defaults.global.defaultFontColor = '#6c757d';
  Chart.defaults.global.defaultFontSize = 14;
  Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 20;
  };

  var date = new Date(countries.site_updated);
  var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  document.getElementById('site_updated').textContent = date.toLocaleString("es-AR", options);

  makeCases(countries.datasets);
  makeDeaths(countries.datasets);
  makeTotal(countries.datasets);
  makeCapita(countries.datasets);
  makeDeathsTotal(countries.datasets);
  makeDeathsCapita(countries.datasets);
  makeTests(countries.datasets);
});
