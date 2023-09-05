<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';

const props = withDefaults(defineProps<{
  selection?: number
  titles: {
    text: string
    value: string
  }[]
}>(), {
  selection: 0
})
const emits = defineEmits(['select'])

let selection = ref(props.selection || 0)

const panelList = ref<HTMLUListElement>()
const titleList = ref<HTMLUListElement>()

function getTabs() {
  const tabs: {
    title: HTMLLIElement,
    item: HTMLLIElement
  }[] = []
  if (!panelList.value || !titleList.value) {
    return tabs
  }

  for (let i = 0; i < panelList.value.children.length; i++) {
    const item = <HTMLLIElement>panelList.value.children[i];
    const title = <HTMLLIElement>titleList.value.children[i]
    
    if (item.classList.contains('tab-item') && title) {
      tabs.push({
        title,
        item
      })
    }
  }

  return tabs
}

function updateTabs() {
  getTabs().forEach((item, i) => {
    item.item.style.display = 'none'
    item.title.className = ''

    if (selection.value == i) {
      item.title.className = 'active'
      item.item.style.display = ''
    }
  })
}

function select(order: number, value: string) {
  selection.value = order
  emits('select', value)
}

onMounted(updateTabs)
watch(selection, updateTabs)
watch(props, () => {
  selection.value = props.selection

  updateTabs()
})
</script>

<template>
  <div class="tab">
    <div class="header">
      <ul ref="titleList">
        <li v-for="(title, i) in props.titles" :key="title.value || title.text" @click="select(i, title.value || title.text)">
          {{ title.text }}
        </li>
      </ul>
    </div>

    <div class="content">
      <ul ref="panelList">
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#tab() {
  header-item-padding: 0.4em 0.7em;
  header-item-border: 2px solid #dark-tab()[header-item-border-color];
  header-item-transition-time: 0.2s;
  header-item-radius: #border-radius()[medium];
}
#dark-tab() {
  header-bg-color: lighten(#dark()[primary], 5%);
  header-item-hover-bg-color: lighten(#dark()[primary], 10%);
  header-item-active-bg-color: lighten(#dark()[primary], 7%);
  header-item-border-color: lighten(#dark()[secondary], 10%);
  header-item-hover-border-color: darken(#dark()[sub], 20%);
  header-item-active-border-color: darken(#dark()[sub], 15%);
}

.tab {
  ul {
    list-style: none;
  }

  > .header {
    > ul {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;

      > li {
        border-radius: #tab()[header-item-radius];
        flex-grow: 1;
        background-color: #dark-tab()[header-bg-color];
        padding: #tab()[header-item-padding];
        text-align: center;
        border: #tab()[header-item-border];
        transition-duration: #tab()[header-item-transition-time];
        cursor: pointer;
        user-select: none;

        &:hover {
          background-color: #dark-tab()[header-item-hover-bg-color];
          border-color: #dark-tab()[header-item-hover-border-color];
        }
        &:active,
        &.active {
          background-color: #dark-tab()[header-item-active-bg-color];
          border-color: #dark-tab()[header-item-active-border-color];
        }
      }
    }
  }

  > .content {

  }
}

</style>