<center>
  <h1>HoYoLab Plus Plus</h1>
  <h5>米游社++</h5>
</center>

## 介绍

正如该项目的字面意思，几乎重新制作米游社的页面，并增加额外的功能。

目前功能尚未完全开发完成。

## 功能介绍

选中框的状态则表明是否完成了当前已有的开发目标。

- 米游社
  - [ ] 文章
    - [ ] 文章操作
    - [ ] 搜索文章
    - [ ] 观测枢
    - [x] 文章查看
    - [x] 论坛文章推荐
  - [ ] 账号
    - [ ] 用户信息查看
    - [ ] 论坛打卡、游戏道具签到
    - [ ] 米游币管理
- 游戏记录
  - [ ] 原神
    - [x] 基本信息
    - [x] 角色信息
    - [ ] 世界探索信息
    - [ ] 尘歌壶信息
    - [ ] 深境螺旋信息
    - [ ] 深境螺旋数据库
    - [ ] 祈愿记录
    - [ ] 祈愿记录数据库
    - [ ] 活动时间表
  - [ ] 崩坏：星穹铁道
  - [ ] 崩坏3
- 游戏工具
  - [ ] 素材消耗计算器
  - [ ] 计划

## 构建

该仓库为HoYoLabPP的前端源代码。如果你在找后端源代码，请点击[此处](https://github.com/Kamisato-Ayaka-233/HoYoLabPP.Backend)。

本项目使用Vite进行构建，因此该处仅给出Vite的构建方式。

1. 拉取源代码
```sh
git clone https://github.com/Kamisato-Ayaka-233/HoYoLabPP.git
cd HoYoLabPP
```

2. 下载依赖项
```sh
npm install
```

3. 构建项目到`dist`文件夹

不进行类型检查的原因：因为许多米游社的接口返回数据并未编写结构，因此如果进行类型检查会导致出错。
```sh
npm run build-only
```

## 贡献者

- [MoRanYue（Kamisato-Ayaka-233）](https://github.com/Kamisato-Ayaka-233)

## 特别鸣谢

- [UIGF组织](https://github.com/UIGF-org)

## 协议

该项目以MIT协议开放源代码。