import type { Question } from "../types";

export const questions: Question[] = [
  {
    id: 1,
    dimension: "mixed",
    prompt: "第一次去新岩馆，你会——",
    options: [
      { key: "A", text: "直接找难线开磕，手感来了再说", scores: ["P"] },
      { key: "B", text: "先观察线路走向，脑内模拟一遍再上手", scores: ["M"] },
      { key: "C", text: "找个角落热热身，等人少了再上", scores: ["L"] },
    ],
  },
  {
    id: 2,
    dimension: "mixed",
    prompt: "爬线时你更享受的是——",
    options: [
      { key: "A", text: "磕过难关那一刻的满足感", scores: ["F"] },
      { key: "B", text: "整个攀爬过程中的沉浸式体验", scores: ["E"] },
      { key: "C", text: "旁边有人喊“牛逼”的氛围感", scores: ["S"] },
    ],
  },
  {
    id: 3,
    dimension: "mixed",
    prompt: "排队等线时看到有人在你磕的线上卡着，你会——",
    options: [
      { key: "A", text: "急得直跺脚，恨不得冲上去抢线", scores: ["P", "anxiety"] },
      { key: "B", text: "正好，趁机研究一下他的动作", scores: ["M"] },
      { key: "C", text: "默默走开，找条别的线先", scores: ["L"] },
    ],
  },
  {
    id: 4,
    dimension: "mixed",
    prompt: "看到墙上的朋友完攀了，你会——",
    options: [
      { key: "A", text: "挺厉害！但我觉得有必要跟他说一下改进的点！", scores: ["S", "doubao"] },
      { key: "B", text: "默默点头，回头研究一下他/她的脚法！", scores: ["M"] },
      { key: "C", text: "这线我也能过", scores: ["P"] },
    ],
  },
  {
    id: 5,
    dimension: "mixed",
    prompt: "给自己定了个月磕 V5 的目标，月底还没到——",
    options: [
      { key: "A", text: "焦虑！必须加班加点冲一冲", scores: ["F"] },
      { key: "B", text: "顺其自然，享受过程比结果重要", scores: ["E"] },
      { key: "C", text: "反正也没人知道我的目标，躺平", scores: ["L"] },
    ],
  },
  {
    id: 6,
    dimension: "mixed",
    prompt: "训练计划被打乱（比如岩馆临时关门），你会——",
    options: [
      { key: "A", text: "急！必须找到替代训练，一天都不能断", scores: ["F", "anxiety"] },
      { key: "B", text: "正好休息一下，明天再练也行", scores: ["E"] },
      { key: "C", text: "在家研究一下动作视频", scores: ["M"] },
    ],
  },
  {
    id: 7,
    dimension: "mixed",
    prompt: "遇到一个难点死活过不去——",
    options: [
      { key: "A", text: "猛干！多试几次肌肉记忆就来了", scores: ["P"] },
      { key: "B", text: "冷静分析，看视频找 beta", scores: ["M"] },
      { key: "C", text: "发个朋友圈求指点", scores: ["S"] },
    ],
  },
  {
    id: 8,
    dimension: "mixed",
    prompt: "看到大佬在线上做超帅 dyno，你会——",
    options: [
      { key: "A", text: "哇！我也要试！直接冲上去模仿", scores: ["S", "doubao"] },
      { key: "B", text: "先拆解动作，想清楚发力再试", scores: ["M"] },
      { key: "C", text: "默默围观，心想“这操作学不来”", scores: ["L"] },
    ],
  },
  {
    id: 9,
    dimension: "mixed",
    prompt: "当众冲坠/掉线了，你的内心活动是——",
    options: [
      {
        key: "A",
        text: "社死！所有人都在看我！但我要装作若无其事继续爬",
        scores: ["E", "L", "anxiety"],
      },
      { key: "B", text: "无所谓，掉就掉了，继续磕", scores: ["P"] },
      { key: "C", text: "尴尬，趁机看看别人怎么过这个点", scores: ["M"] },
    ],
  },
  {
    id: 10,
    dimension: "mixed",
    prompt: "在岩馆里你最享受的时刻是——",
    options: [
      { key: "A", text: "当众完成一条超帅的线，享受围观喝彩", scores: ["F", "S"] },
      { key: "B", text: "一个人安静地解锁了困扰很久的动作", scores: ["L"] },
      { key: "C", text: "在我的beta下墙上的岩友顺利完攀！", scores: ["M", "doubao"] },
    ],
  },
  {
    id: 11,
    dimension: "mixed",
    prompt: "周末岩馆人超多，你会——",
    options: [
      { key: "A", text: "人越多越嗨，气氛组上线", scores: ["S"] },
      { key: "B", text: "找个人少的角落安静刷线", scores: ["L"] },
      { key: "C", text: "不管人多人少，硬线照磕不误", scores: ["P"] },
    ],
  },
  {
    id: 12,
    dimension: "mixed",
    prompt: "选线时，你更看重——",
    options: [
      { key: "A", text: "这条线能不能让我变强", scores: ["F"] },
      { key: "B", text: "这条线爬起来有没有意思", scores: ["E"] },
      { key: "C", text: "这条线出不出片", scores: ["S"] },
    ],
  },
  {
    id: 13,
    dimension: "mixed",
    prompt: "攀岩结束后，你通常——",
    options: [
      { key: "A", text: "看一下今天录的视频哪里有改进的地方。", scores: ["F"] },
      { key: "B", text: "发个朋友圈show一下自己的战况！", scores: ["E"] },
      { key: "C", text: "跟岩友交流今天的线路心得", scores: ["E"] },
    ],
  },
  {
    id: 14,
    dimension: "mixed",
    prompt: "朋友约你一起去野攀，但天气预报说可能下雨——",
    options: [
      { key: "A", text: "感觉野攀很会很有趣！去碰碰运气吧！", scores: ["E"] },
      { key: "B", text: "算了，在家研究动作更靠谱。", scores: ["L"] },
      { key: "C", text: "看情况，主要想和大家一起出去玩", scores: ["S"] },
    ],
  },
  {
    id: 15,
    dimension: "mixed",
    prompt: "回顾你的攀岩初心，最接近——",
    options: [
      { key: "A", text: "我想变强，解锁更多线路", scores: ["F"] },
      { key: "B", text: "只是我众多运动爱好之一啦~", scores: ["E"] },
      { key: "C", text: "看看自己练的背好不好使！", scores: ["P"] },
    ],
  },
];
