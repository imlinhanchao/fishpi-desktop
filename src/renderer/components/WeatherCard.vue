<template>
    <div v-if="weatherData" class="weather-card">
      <h3 class="area"> {{ weatherData.t }}</h3>
      <p class="description">{{ weatherData.st }}</p>
      <div class="weather-info">
        <div v-for="(date, index) in dateArray" :key="index" class="weather-day">
          <p class="date">{{ date }}</p>
          <p class="maxtemp">最高温: {{ maxTempArray[index] }}°C</p>
          <p class="mintemp">最低温: {{ minTempArray[index] }}°C</p>
          <img 
            :src="`/src/renderer/assets/weather/${weatherDescriptionArray[index]}.svg`" 
            alt="Weather Icon"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      md: {
        required: true
      }
    },
    data() {
      return {
        weatherData: null
      };
    },
    computed: {
      // 分离
      dateArray() {
        return this.weatherData ? this.weatherData.date.split(',') : [];
      },
      maxTempArray() {
        return this.weatherData ? this.weatherData.max.split(',') : [];
      },
      minTempArray() {
        return this.weatherData ? this.weatherData.min.split(',') : [];
      },
      weatherDescriptionArray() {
        return this.weatherData ? this.weatherData.weatherCode.split(',') : [];
      },
    },
    mounted() {
        this.weatherData = JSON.parse(this.md);
    },
    methods: {
    },
};
  </script>
  
  <style scoped>
  .area,
  .description 
  {
    color: #070707;
  }
  
  .weather-card {
    background-color: #f0f8ff;
    padding: 5px 10px;
    border-radius: 6px;
    margin-left: 13px;
  }
  
  .weather-info {
    display: flex;
    flex-wrap: wrap;
  }
  
  .weather-day {
    width: 20%;
    padding: 5px;
    color: #070707;
    font-size: 13px;
  }
  </style>
  