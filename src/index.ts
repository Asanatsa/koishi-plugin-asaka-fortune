import { timeStamp } from 'console'
import { Context, Schema, Random } from 'koishi'

export const name = 'asaka-fortune'

export const inject = ['database']

export interface Config { }

export const Config: Schema<Config> = Schema.object({})


// create new table 
declare module 'koishi' {
    interface Tables {
        asakafortune: asakafortuneDatabase
    }
}

export interface asakafortuneDatabase {
    id: number
    platform: string
    timestamp: Date
    data: object
}

// 问候词
let graetingText = [
    // 早
    ["#user#早上好ヾ(•ω•`)o", "#user#早好捏~", "#user#早(´～`)"],
    // 中
    ["#user#中午好（￣▽￣）", "#user#午好捏", "#user#午好~现在睡午觉再合适不过了♪(´▽｀)",],
    // 下午
    ["#user#下午好~"],
    // 晚上
    ["#user#晚上好", "#user#晚好~", "#user#晚好~时间不早该睡觉了捏(*-ω-)"]
]

let fortune = ["大凶", "凶", "小凶", "小吉", "吉", "大吉"]

let fortuneSummary = [
    // 大凶
    ["今天运气有点不太好呢……", "今日不宜买彩票（", "emm……就是随机数而已…不要太放在心上捏", "(っ °Д °;)っ"],
    // 凶
    ["比大凶强", "差一点大凶(lll￢ω￢)", "/_ \\"],
    // 小凶
    ["还好(￣▽￣)\"", "一般般吧(￣_,￣ )", "不好不坏"],
    // 小吉
    ["不差(￣▽￣)\"", "不好不坏", "今天运气还好(￣▽￣)\""],
    // 吉
    ["嗯……还好(～￣▽￣)～", "今天运气还不错捏,,ԾㅂԾ,,", "(～￣▽￣)～"],
    // 大吉
    ["运气爆棚！ヾ(≧▽≦*)o", "今日诸事皆宜~", "今日宜买彩票（划"],
]

export function apply(ctx: Context) {


    ctx.command("fortune", "今日运势")
        .alias("运势")
        .alias("今日运势")
        //.option("aaa", "-a")
        .action(async ({ options, session }) => {

            ctx.model.extend("asakafortune", {
                // 各字段的类型声明
                id: 'unsigned',
                platform: "string",
                timestamp: 'timestamp',
                data: "json",
            })

            //user id in koishi database
            let userId = (await ctx.database.getUser(session.event.platform, session.event.user.id, ["id"])).id
            let userPlatform = session.event.platform
            let userData = await ctx.database.get("asakafortune", userId);
            let result = {} as { a?: number, b?: number, c?: number, level?: number, sid?: number };

            let date = new Date();
            let period = 0;

            if (5 <= date.getHours() && date.getHours() < 10) {
                // 早
                period = 0;
            } else if (10 <= date.getHours() && date.getHours() < 14) {
                // 中午
                period = 1;
            } else if (14 <= date.getHours() && date.getHours() < 19) {
                // 下午
                period = 2;
            } else if (19 <= date.getHours() || date.getHours() < 5) {
                // 晚上
                period = 3;
            }

            let graeting = Random.pick(graetingText[period]).replace("#user#", session.event.user.name);


            // 财运
            result["a"] = Random.int(1, 11);
            // 桃花运
            result["b"] = Random.int(1, 11);
            // 事业运
            result["c"] = Random.int(1, 11);

            let total = result.a + result.b + result.c;

            // 计算等级
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

            result.sid = Random.int(0, fortuneSummary[result.level].length);


            if (userData.length !== 0) {
                let timestamp = new Date(userData[0].timestamp)
                if (timestamp.toLocaleDateString() === date.toLocaleDateString()) {
                    let fdata = userData[0].data as { a?: number, b?: number, c?: number, level?: number, sid?: number };



                    let outText = `${graeting}\n今天已经抽过了\n别想骗我\<( ￣^￣)\n\n` +
                        `财运：${fdata.a}\n` +
                        `桃花运：${fdata.b}\n` +
                        `事业运：${fdata.c}\n\n` +
                        `整体运势：${fortune[fdata.level]}\n\n` +
                        `${fortuneSummary[fdata.level][fdata.sid]}`;

                    return outText;
                } else {
                    // 保存数据到数据库
                    await ctx.database.upsert("asakafortune", (row) => [
                        { id: userId, platform: userPlatform, timestamp: new Date(), data: result }
                    ])

                    let outText = `${graeting}\n今天就由我来给你占卜一下吧♪(^∇^*)\n\n` +
                        `财运：${result.a}\n` +
                        `桃花运：${result.b}\n` +
                        `事业运：${result.c}\n\n` +
                        `整体运势：${fortune[result.level]}\n\n` +
                        `${fortuneSummary[result.level][result.sid]}`;

                    return outText;
                }
            } else {

                // 保存数据到数据库
                await ctx.database.upsert("asakafortune", (row) => [
                    { id: userId, platform: userPlatform, timestamp: new Date(), data: result }
                ])

                let outText = `${graeting}\n今天就由我来给你占卜一下吧♪(^∇^*)\n\n` +
                    `财运：${result.a}\n` +
                    `桃花运：${result.b}\n` +
                    `事业运：${result.c}\n\n` +
                    `整体运势：${fortune[result.level]}\n\n` +
                    `${fortuneSummary[result.level][result.sid]}`;

                return outText;

            }



            //return JSON.stringify(await ctx.database.stats())
            //return JSON.stringify(await ctx.database.get("asakafortune", userId));

        })


}
