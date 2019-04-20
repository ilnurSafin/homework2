/* Домашнее задание #2 от Ильнура Сафина для МодульСтарта
 * Контакты: 8-961-356-41-46, rocknrollmgn@gmail.com
 * 
 */
import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadCurrency() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const currencyData = parser.parseFromString(xmlTest, "text/xml");
  /* Пример:
    <FORECAST day="20" month="04" year="2019" hour="21" tod="3" predict="0" weekday="7">
    <PHENOMENA cloudiness="3" precipitation="10" rpower="0" spower="0"/>
    <PRESSURE max="768" min="767"/>
    <TEMPERATURE max="11" min="2"/>
    <WIND min="1" max="3" direction="0"/>
    <RELWET max="70" min="36"/>
    <HEAT min="-1" max="-1"/>
    </FORECAST>
  */
  const forecasts = currencyData.getElementsByTagName("FORECAST");
  const result = Object.create(null);
  for (let i = 0; i < forecasts.length; i++) {
    result[i] = Object.create(null);
    const hour = forecasts[i].getAttribute("hour");//Считываем время(час), в которое предполагается примерная температура
    //добавить минуты, если в будущем они будут предоставляться в xml
    //const minute = forecasts[i].getAttribute("minute");
    const max_temp = forecasts[i].children[2].getAttribute("max");//максимально возможная температура
    const min_temp = forecasts[i].children[2].getAttribute("min");//минимально возможная температура
    const avg_temp = (parseInt(max_temp) + parseInt(min_temp))/2.;
    const heat = forecasts[i].children[5].getAttribute("min");
    result[i].temp = avg_temp;
    result[i].feel_temp = heat;
    result[i].hour = hour;
    //добавить минуты, если в будущем они будут предоставляться в xml
    //result[i].minute = minute;
  }
  return result;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const normalData = await loadCurrency();
  const keys = Object.keys(normalData);//[0,1,2,3]
  //при реализации минут замени нижнюю строку, на эту:
  //const plotDataLabels = keys.map(key => normalData[key].hour + ":" + normalData[key].minute);
  const plotDataLabels = keys.map(key => normalData[key].hour + ":00");//[0,1,2,3] => ["12:00",...]
  const plotDataTemperature = keys.map(key => normalData[key].temp);//[0,1,2,3] => ["10",...]
  const plotDataFeelTemperature = keys.map(key => normalData[key].feel_temp);//[0,1,2,3] => ["5",...]

  const chartConfig = {
    type: "line",

    data: {
      labels: plotDataLabels,
      datasets: [
        {
          label: "Температура",
          backgroundColor: "rgba(255, 20, 20, 0.5)",
          borderColor: "rgba(180, 0, 0, 0.5)",
          data: plotDataTemperature
        },
        {
          label: "Температура по ощущениям",
          backgroundColor: "rgba(20, 255, 20, 0.5)",
          borderColor: "rgba(0, 180, 0, 0.5)",
          data: plotDataFeelTemperature
        }
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: 'index',
        intersect: false,
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
            labelString: 'Время'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Температура, ℃'
          }
        }]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.options = chartConfig.options;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});