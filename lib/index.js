var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var name = "asaka-fortune";
var inject = ["database"];
var Config = import_koishi.Schema.object({});
var graetingText = [
  // 早
  ["#user#早上好ヾ(•ω•`)o", "#user#早好捏~", "#user#早(´～`)"],
  // 中
  ["#user#中午好（￣▽￣）", "#user#午好捏", "#user#午好~现在睡午觉再合适不过了♪(´▽｀)"],
  // 下午
  ["#user#下午好~"],
  // 晚上
  ["#user#晚上好", "#user#晚好~", "#user#晚好~时间不早该睡觉了捏(*-ω-)"]
];
var fortune = ["大凶", "凶", "小凶", "小吉", "吉", "大吉"];
var fortuneSummary = [
  // 大凶
  ["今天运气有点不太好呢……", "今日不宜买彩票（", "emm……就是随机数而已…不要太放在心上捏", "(っ °Д °;)っ"],
  // 凶
  ["比大凶强", "差一点大凶(lll￢ω￢)", "/_ \\"],
  // 小凶
  ['还好(￣▽￣)"', "一般般吧(￣_,￣ )", "不好不坏"],
  // 小吉
  ['不差(￣▽￣)"', "不好不坏", '今天运气还好(￣▽￣)"'],
  // 吉
  ["嗯……还好(～￣▽￣)～", "今天运气还不错捏,,ԾㅂԾ,,", "(～￣▽￣)～"],
  // 大吉
  ["运气爆棚！ヾ(≧▽≦*)o", "今日诸事皆宜~", "今日宜买彩票（划"]
];
function apply(ctx) {
  ctx.command("fortune", "今日运势").alias("运势").alias("今日运势").action(async ({ options, session }) => {
    ctx.model.extend("asakafortune", {
      // 各字段的类型声明
      id: "unsigned",
      platform: "string",
      timestamp: "timestamp",
      data: "json"
    });
    let userId = (await ctx.database.getUser(session.event.platform, session.event.user.id, ["id"])).id;
    let userPlatform = session.event.platform;
    let userData = await ctx.database.get("asakafortune", userId);
    let date = /* @__PURE__ */ new Date();
    let period = 0;
    if (5 <= date.getHours() && date.getHours() < 10) {
      period = 0;
    } else if (10 <= date.getHours() && date.getHours() < 14) {
      period = 1;
    } else if (14 <= date.getHours() && date.getHours() < 19) {
      period = 2;
    } else if (19 <= date.getHours() || date.getHours() < 5) {
      period = 3;
    }
    if (userData.length !== 0) {
      let timestamp = new Date(userData[0].timestamp);
      if (timestamp.toLocaleDateString() === date.toLocaleDateString()) {
        let result = userData[0].data;
        let graeting = import_koishi.Random.pick(graetingText[period]).replace("#user#", session.event.user.name);
        let outText = `${graeting}
今天已经抽过了
别想骗我<( ￣^￣)

财运：${result.a}
桃花运：${result.b}
事业运：${result.c}

整体运势：${fortune[result.level]}

${fortuneSummary[result.level][result.sid]}`;
        return outText;
      }
    } else {
      let result = {};
      result["a"] = import_koishi.Random.int(1, 11);
      result["b"] = import_koishi.Random.int(1, 11);
      result["c"] = import_koishi.Random.int(1, 11);
      let total = result.a + result.b + result.c;
      if (total <= 5) {
        result.level = 0;
      } else if (total <= 11) {
        result.level = 1;
      } else if (total <= 16) {
        result.level = 2;
      } else if (total <= 20) {
        result.level = 3;
      } else if (total <= 25) {
        result.level = 4;
      } else if (total <= 30) {
        result.level = 5;
      }
      result.sid = import_koishi.Random.int(0, fortuneSummary[result.level].length);
      await ctx.database.upsert("asakafortune", (row) => [
        { id: userId, platform: userPlatform, timestamp: /* @__PURE__ */ new Date(), data: result }
      ]);
      let graeting = import_koishi.Random.pick(graetingText[period]).replace("#user#", session.event.user.name);
      let outText = `${graeting}
今天就由我来给你占卜一下吧♪(^∇^*)

财运：${result.a}
桃花运：${result.b}
事业运：${result.c}

整体运势：${fortune[result.level]}

${fortuneSummary[result.level][result.sid]}`;
      return outText;
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
