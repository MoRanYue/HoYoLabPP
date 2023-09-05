<script setup lang="ts">


</script>

<template>
  <div class="not-found">
    <div class="error-code">
      <span v-for="item in ['4', '0', '4']" :key="item">{{ item }}</span>
    </div>
    <p>什么也没找到</p>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

#not-found() {
  desc-size: 2rem;
  code-size: 12rem;
  code-size-transform: 3em;
  code-size-transfrom-delay: 0.6s;
  margin: 5em;
}
#dark-not-found() {

}

@keyframes code-size-transform {
  from {
    font-size: #not-found()[code-size] - #not-found()[code-size-transform];
  }
  to {
    font-size: #not-found()[code-size] + #not-found()[code-size-transform];
  }
}

.not-found {
  p {
    text-align: center;
    font-size: #not-found()[desc-size];
  }

  .error-code {
    text-align: center;
    margin: #not-found()[margin];
    height: #not-found()[code-size] + #not-found()[code-size-transform];

    > span {
      font-size: #not-found()[code-size] - #not-found()[code-size-transform];
      animation: code-size-transform 1s linear infinite alternate;

      each(range(1, 3), {
        &:nth-child(@{value}) {
          animation-delay: (@value - 1) * #not-found()[code-size-transfrom-delay];
        }
      })
    }
  }
}

</style>