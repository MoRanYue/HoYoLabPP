<script setup lang="ts">
import VCard from '@/components/VCard.vue'
import VTab from '@/components/VTab.vue';
import VTabItem from '@/components/VTabItem.vue';
import VHomeSimilarProjectItem from '@/components/VHomeSimilarProjectItem.vue'; 

const rules: string[] = [
  '在该声明中，上海米哈游网络科技股份有限公司将简称为“米哈游”。',
  '本网站不会存储你的任何账号凭证、Cookie、Token、密钥等敏感信息，仅存储你的米游社AID和MID（用于标记抽卡记录等非隐私数据），所有来自米游社的信息都将存储在浏览器本地。',
  '本网站使用你的米游社账号亦用于一些功能的操作，例如自动化操作，可能会向你索取米游社凭证、Cookie、Token、密钥。所有Cookie在操作完成后将在服务器中被删除。',
  '本网站的服务器仅用于帮助客户端发送请求至米哈游服务器，以及用于特定功能和账号标识的数据库。',
  '本网站不隶属于米哈游，与米哈游官方没有任何关系。关于米哈游通行证账号的政策，详见<a href="https://user.mihoyo.com/#/agreement" target="_blank">《米哈游用户协议》</a>与<a href="https://user.mihoyo.com/#/privacyAgreement" target="_blank">《米哈游隐私政策》</a>。',
  '如果你继续使用，则表示你同意将在必要情况下将你的米游社账号凭证、Cookie、Token、密钥通过该网站的服务器转发至米游社服务器，以解决浏览器跨域问题；若你不同意，可以<a href="javascript:const w = window.open(\'about:blank\', \'_self\'); w.close();">点击此处</a>关闭该页面。'
]
</script>

<template>
  <div class="home">
    <section class="header">
      <h1 class="title">HoYoLab PP</h1>
      <h2>“HoYoLab PP”的全名为“HoYoLab Plus Plus”，中文名为“米游社++”。正如字面意思，为米游社增加便携性。</h2>
    </section>

    <section class="main">
      <v-card perspective shadow title="功能介绍" icon="multi-function-knife">
        <div class="functions-introduce">
          拥有米游社基本的文章、游戏记录和账号等基本功能。<br>
          除此之外，增加米游社自动签到功能、抽卡数据统计功能。
        </div>
      </v-card>

      <v-card perspective shadow title="声明" icon="book">
        <div class="statement">
          <ol>
            <li v-for="rule in rules">
              <span v-html="rule"></span>
            </li>
          </ol>
        </div>
      </v-card>

      <v-card title="类似项目" icon="experiment">
        <v-tab class="similar-project-tab" :selection="0" :titles="[
          {text: 'Snap Hutao', value: 'snapHutao'},
          {text: 'Teyvat Guide', value: 'teyvatGuide'},
          {text: '提瓦特小助手', value: 'teyvatHelper'},
          {text: 'Paimon Moe', value: 'paimonMoe'},
          {text: '寻空', value: 'xunKong'},
          {text: 'Yae Achievement', value: 'yaeAchievement'},
          {text: '椰羊 Cocogoat', value: 'cocogoat'},
          {text: 'Sangonomiya', value: 'sangonomiya'}
        ]">
          <v-tab-item>
            <v-home-similar-project-item project="Snap Hutao" id="snapHutao" author="DGP Studio" desc="胡桃工具箱是一个Windows平台的开源的原神工具箱，旨在帮助玩家获得更好的游戏体验"
            :type="['windows']" 
            :links="{
              gitHub: 'https://github.com/DGP-Studio/Snap.Hutao',
              appStore: 'https://apps.microsoft.com/detail/snap-hutao/9PH4NXJ2JN52',
              officalWebsite: 'https://hut.ao/zh'
            }" 
            :supported-functions="{
              gameRecord: {
                genshinImpact: true,
                dailyNote: true,
                regularTowerActivity: true,
                uploadable: true
              },
              drawingRecord: {
                analysis: true,
                exportable: true,
                exportAsTheFormatsDefinedByUigfOrg: true,
                importable: true,
                importTheFormatsDefinedByUigfOrg: true,
                genshinImpact: true
              },
              hoyolab: {
                needToLogin: true,
                readAnnouncement: true
              },
              planning: {
                calculated: true,
                character: true,
                weapon: true,
                item: true
              },
              gameLauncher: {
                gameAnnouncement: true,
                switchAccount: true,
                genshinImpact: true
              },
              achievement: {
                analysis: true,
                exportable: true,
                exportAsTheFormatsDefinedByUigfOrg: true,
                importable: true,
                importTheFormatsDefinedByUigfOrg: true,
                management: true,
                genshinImpact: true
              },
              wiki: {
                character: true,
                weapon: true,
                enemy: true
              }
            }"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="Teyvat Guide" id="teyvatGuide" author="BTMuli" desc="基于Tauri的原神助手应用" :type="['windows']" 
            :links="{
              gitHub: 'https://github.com/BTMuli/TeyvatGuide',
              appStore: 'https://apps.microsoft.com/detail/teyvat-guide/9NLBNNNBNSJN'
            }" 
            :supported-functions="{
              achievement: {
                genshinImpact: true,
                analysis: true,
                importable: true,
                importTheFormatsDefinedByUigfOrg: true,
                exportable: true,
                exportAsTheFormatsDefinedByUigfOrg: true,
                management: true
              },
              gameRecord: {
                genshinImpact: true,
                regularTowerActivity: true
              }, 
              drawingRecord: {
                analysis: true,
                genshinImpact: true,
                importable: true,
                importTheFormatsDefinedByUigfOrg: true,
                exportable: true,
                exportAsTheFormatsDefinedByUigfOrg: true
              },
              hoyolab: {
                readAnnouncement: true,
                readArticle: true,
                needToLogin: true
              },
              calendar: {
                material: true,
                activity: true,
                drawingPool: true
              }
            }"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="提瓦特小助手" id="teyvatHelper" :type="['weChatMini']" desc="《提瓦特小助手》是专注旅行者服务的微信小程序" 
            :links="{
              officalWebsite: 'https://www.yshelper.com/'
            }" :supported-functions="{}"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="Paimon Moe" id="paimonMoe" :type="['web']" desc="带有祈愿分析与角色计算器等功能的小工具" 
            :links="{
              officalWebsite: 'https://paimon.moe/'
            }" :supported-functions="{
              achievement: {
                analysis: true,
                genshinImpact: true,
                exportable: true,
                importable: true,
                management: true
              },
              calendar: {
                drawingPool: true,
                genshinImpact: true,
                material: true,
              },
              drawingRecord: {
                analysis: true,
                genshinImpact: true
              }
            }"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="寻空" author="Scighost" id="xunKong" :type="['windows']" desc="寻空可以帮你统计和分析原神游戏中的各项数据，快速掌握账号的相关信息" 
            :links="{
              officalWebsite: 'https://xunkong.cc/',
              gitHub: 'https://github.com/xunkong/xunkong',
              appStore: 'https://www.microsoft.com/store/apps/9N2SVG0JMT12'
            }" :supported-functions="{}"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="Yae Achievement" author="HolographicHat" id="yaeAchievement" :type="['windows']" desc="一个简单的原神成就管理工具" 
            :links="{
              gitHub: 'https://github.com/HolographicHat/YaeAchievement'
            }" :supported-functions="{}"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="椰羊 Cocogoat" author="月海亭 YuehaiTeam" id="cocogoat" :type="['web']" desc="网页端原神工具箱" 
            :links="{
              gitHub: 'https://github.com/YuehaiTeam/cocogoat',
              officalWebsite: 'https://cocogoat.work/'
            }" :supported-functions="{}"></v-home-similar-project-item>
          </v-tab-item>

          <v-tab-item>
            <v-home-similar-project-item project="Sangonomia" author="AuroraZiling" id="sangonomia" :type="['windows']" desc="原神祈愿记录工具" 
            :links="{
              gitHub: 'https://github.com/AuroraZiling/sangonomiya',
              hostedWebsite: 'https://sangonomiya.coding.net/public-artifacts/sangonomiya/pre-release/packages'
            }" :supported-functions="{}"></v-home-similar-project-item>
          </v-tab-item>
        </v-tab>
      </v-card>
    </section>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

#home() {
  title-size: 6rem;
  section-interval: 1.1em;
  card-interval: 0.9em;
}
#dark-home() {

}

.home {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  width: 50%;

  > section {
    margin-bottom: #home()[section-interval];
  }

  .header {
    text-align: center;

    .title {
      font-size: #home()[title-size];
      font-weight: 900;
      background: linear-gradient(45deg, darken(#color()[blue], 10%), darken(#color()[white], 4%));
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    each(range(1, 6), {
      h@{value} {
        font-family: "LXGW WenKai", sans-serif;
      }
    })
  }

  .main {
    // overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;

    .card {
      margin-bottom: #home()[card-interval];
    }

    .similar-project-tab {
      
    }
  }
}
</style>
