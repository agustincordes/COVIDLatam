var Countries = ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Mexico', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela'];

var Colors = ['#66FF66', '#C95A49', '#FF00CC', '#50BFE6', '#FF9933', '#FF355E', '#FFFF66',
              '#44D7A8', '#FEFEFA', '#CCFF00', '#DB91EF']

var Population = [43132000, 11005000, 204519000, 18006000, 48218000, 16279000, 121006000, 7003000, 32153000, 3310000, 30620000];

function makeCases(data) {
  const filteredData = data
    .filter(d => Countries.indexOf(d.Country) > -1)
    .map((obj, idx) => ({ ...obj, Color: Colors[idx] }));

  const countryLabels = filteredData.map(d => d.Country);
  const filteredCases = filteredData.map(d => d.PerCapita);
  const filteredColors = filteredData.map(d => d.Color);

  Chart.defaults.global.defaultFontColor = '#6c757d';
  Chart.defaults.global.defaultFontSize = 14;
  Chart.Legend.prototype.afterFit = function() {
    this.height = this.height + 20;
  };

  var chart = new Chart('cases', {
    type: "line",
    data: {
      labels: Array.from({length: filteredData[2].Daily.length}, (v, k) => k + 1), // Ugly hardcode
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
              borderColor: filteredData[0].Color,
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

  for (var i = 0; i < filteredData.length; i++) {
    var newDataset = {
      label: filteredData[i].Country,
      data: filteredData[i].Daily,
      borderColor: filteredData[i].Color,
      backgroundColor: filteredData[i].Color,
      fill: false
    };

    chart.data.datasets.push(newDataset);
    chart.update();
  }
}

function makeCapita(data) {
  const filteredData = data
    .filter(d => Countries.indexOf(d.Country) > -1)
    .map((obj, idx) => ({ ...obj, Color: Colors[idx] }))
    .map((obj, idx) => ({ ...obj, PerCapita: Math.ceil((obj.Total / Population[idx]) * 1000000) }))
    .sort((a, b) => a.PerCapita < b.PerCapita);

  const countryLabels = filteredData.map(d => d.Country);
  const filteredCases = filteredData.map(d => d.PerCapita);
  const filteredColors = filteredData.map(d => d.Color);

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
  const filteredData = data
    .filter(d => Countries.indexOf(d.Country) > -1)
    .map((obj, idx) => ({ ...obj, Color: Colors[idx] }))
    .sort((a, b) => a.Total < b.Total);

  const countryLabels = filteredData.map(d => d.Country);
  const filteredCases = filteredData.map(d => d.Total);
  const filteredColors = filteredData.map(d => d.Color);

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

function processData(data) {
  makeCases(data);
  makeCapita(data);
  makeTotal(data);
}

d3
  .csv("csse_covid_19_data/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv", function(data) {
    var dailyData = d3.map(data, function(d){return(d.group)}).values().slice(4); // Trim all data until dates begin
    dailyData = dailyData.map(Number).filter(Number);

    if (data['Country/Region'] == 'Argentina') {
      // La tabla oficial de John Hopkins tiene un error en los datos, falta un reporte. Este parche lo corrige según datos del gobierno de Argentina.
      dailyData[21] = dailyData[20];
      dailyData[20] = dailyData[19];
      dailyData[19] = 225; // Este es el reporte faltante
      console.log(dailyData);
    }

    return {
      Country: data['Country/Region'],
      Daily: dailyData,
      Total: dailyData[dailyData.length - 1]
      };
    })
  .then(processData);
