<script setup>
import CategorySection from './components/CategorySection.vue'
import articles from './mockData/articles.json'
import mockCategories from './mockData/categories.json'

</script>

<template>
  <header><h1>Noticias App</h1></header>

  <main>
    <CategorySection
      v-for="c in mockCategories"
      :key="c.id"
      :category-title="c.categoryTitle"
      :bg-color="c.bgColor"
      :articles="articles.find((a) => a.articlesId === c.articlesId)"
    />
  </main>
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
