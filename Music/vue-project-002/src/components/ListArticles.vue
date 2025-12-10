<script setup>
import { getPlaceholderSrc } from '@/utils/index.js';

const props = defineProps({
  title: String,
  description: String,
  img: Object,
})

//const imgSrc = `https://placeholdit.com/${props.img.size}/${props.img.textColor}/${props.img.backColor}`
</script>
<template>
  <!-- articles -->
  <article class="articles">
    <header>
      <h3 class="articles__title">{{ title }}</h3>
    </header>
    <main>
      <div class="img-container">
        <img :src="getPlaceholderSrc(props.img.size, props.img.textColor, props.img.backColor)" alt="mock-image" class="img-responsive" />
      </div>
      <p>{{ description }}</p>
    </main>
  </article>
</template>
<style scoped>
.articles {
  border: 1px solid blue;
  margin: 10px;
  width: 150px;
  padding: 10px;
}
.articles__title {
  text-align: center;
}
.img-container {
  max-width: 100px;
  margin: auto;
}
.img-responsive {
  max-width: 100%;
}
</style>
