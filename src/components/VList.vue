<script setup lang="ts">
import { Shape } from '@N/EShape';
import { ListType } from '@N/EListType';

const props = withDefaults(defineProps<{
  type?: keyof typeof ListType
  decoration?: keyof typeof Shape
  icon?: string
}>(), {
  type: 'unordered',
  decoration: 'square',
  icon: undefined
})
</script>

<template>
  <div class="list">
    <ul class="unordered" v-if="props.type == 'unordered'">
      <slot></slot>
    </ul>
    <ol class="ordered" v-else-if="props.type == 'ordered'">
      <slot></slot>
    </ol>
    <ul class="article-list" v-else-if="props.type == 'article'">
      <slot></slot>
    </ul>
  </div>
</template>

<style lang="less" scoped>
@import '@AC/base.less';

#dark-list() {

}
#list() {

}

#dark-article-list() {
  bg-color: darken(#dark()[sub], 50%);
}

.list-style {
  margin: 0 0 0 20px;
  width: 100%;
  height: 100%;
}

.list {
  .ordered {
    .list-style()
  }
  .unorderd {
    .list-style();
  }

  .article-list {
    width: 100%;
    height: 100%;
    list-style: none;
    background: #dark-article-list()[bg-color];
  }
}
</style>
