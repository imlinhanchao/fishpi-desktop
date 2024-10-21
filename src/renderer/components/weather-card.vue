<template>
  <div v-if="data" class="weather-card">
    <h3 class="area"> {{ data.t }}</h3>
    <p class="description">{{ data.st }}</p>
    <div class="weather-info">
      <div v-for="(date, index) in dateArray" :key="index" class="weather-day">
        <p class="date">{{ date }}</p>
        <p class="maxtemp">最高温: {{ maxTempArray[index] }}°C</p>
        <p class="mintemp">最低温: {{ minTempArray[index] }}°C</p>
        <img 
          :src="`../assets/weather/${weatherDescriptionArray[index]}.svg`" 
          alt="Weather Icon"
        />
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    props: {
      data: {
        required: true
      }
    },
    data() {
      return {
      };
    },
    computed: {
      // 分离
      dateArray() {
        return this.data ? this.data.date.split(',') : [];
      },
      maxTempArray() {
        return this.data ? this.data.max.split(',') : [];
      },
      minTempArray() {
        return this.data ? this.data.min.split(',') : [];
      },
      weatherDescriptionArray() {
        return this.data ? this.data.weatherCode.split(',') : [];
      },
    },
    mounted() {
    },
    methods: {
    },
};
  </script>
  
  <style scoped>
  .weather-card {
    color: var(--main-chatroom-message-color);
    background-color: var(--main-chatroom-message-background-color);
    padding: 5px 10px;
    border-radius: 6px;
  }
  
  .weather-info {
    display: flex;
    flex-wrap: wrap;
  }
  
  .weather-day {
    width: 20%;
    padding: 5px;
    opacity: .7;
    font-size: 13px;
  }
  </style>
  