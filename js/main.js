function makeCases(data) {
  var chart = new Chart('cases', {
    type: "line",
    data: {
      labels: Array.from({length: data[2].cases.length}, (v, k) => k + 1), // Ugly hardcode
    },
    options: {
        maintainAspectRatio: false,
        aspectRatio: 0.4,
        responsive: true,
        title: {
          display: true,
          text: 'EVOLUCION DE CASOS',
          fontColor: '#f8f9fa',
          fontSize: 16
        },
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

function makeCapita(data) {
  // Calculamos los casos per capita y ordenamos de mayor a menor caso
  const filteredData = data
    .map((obj, idx) => ({ ...obj, capita: Math.ceil((obj.cases[obj.cases.length - 1] / obj.population) * 1000000) }))
    .sort((a, b) => a.capita < b.capita ? 1 : -1);

  // Filtramos los datos en arrays separados para Chart.js
  const countryLabels = filteredData.map(d => d.name);
  const filteredCases = filteredData.map(d => d.capita);
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

  makeCases(countries);
  makeCapita(countries);
  makeTotal(countries);
});
