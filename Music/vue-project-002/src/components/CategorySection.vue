<script setup>
import ListArticles from './ListArticles.vue'

const props = defineProps({
  categoryTitle: Object,
  bgColor: String,
  articles: Object,
})
</script>

<template>
  <!-- articles container -->
  <header>
    <h2>{{ props.categoryTitle }}</h2>
  </header>
  <section class="articles-container" :style="`background-color:${props.bgColor}`">
    <ListArticles
      v-for="articles in props.articles.articles"
      :key="articles.id"
      :title="articles.title"
      :description="articles.description"
      :img="articles.img"
      :articlesId="articles.articlesId"
    />
  </section>
</template>

<style scoped>
.articles-container {
  height: 600px;
  border: 2px solid green;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
