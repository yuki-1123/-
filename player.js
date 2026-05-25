// =========================
// 玩家数据
// =========================
let player = {
    // 基础
    name: "无名修士",
    gender: "",
    
    // 修炼
    realmIdx: 0,
    cultivation: 0,
    hp: 100,
    mp: 50,
    
    // 灵根
    rootType: 0,
    elements: ["金"],
    
    // 职业
    jobIdx: 0,
    currentSect: "散修",
    
    // 资源
    stones: 500,
    highStones: 0,
    bankStone: 0,
    
    // 属性
    luck: 1,
    fame: 1,
    learn: 1,
    profExp: 1,
    
    // 新增属性
    comprehension: 1,
    body: 1,
    charm: 1,
    reputation: 1,
    
    // 功法
    mainSkill: null,
    skills: [],
    skillLevel: 1,
    skillExp: 0,
    skillTier: 0,
    
    // 装备
    equipped: null,
    inventory: [],
    buffs: [],
    
    // 社交
    partner: null,
    partnerElements: null,
    partnerSkill: null,
    favor: 0,
    
    // 宗门
    contribution: 0,
    rankIdx: 0,
    
    // 特殊
    pet: null,
    honorTitle: "",
    
    // 时间
    day: 1,
    hour: 3,
    age: 12,
    actionPoints: 10,
    maxActionPoints: 10,
    
    // 灵根系统
    washCount: 0,
    rootRerollLeft: 3,
    
    // 数据统计
    totalKills: 0,
    totalDeaths: 0,
    totalBossDamage: 0,
    
    // 白玉京
    baiYuJingWins: 0,
    
    // 成就
    achievements: [],
    
    // 寿命系统
    lifeSpan: 80,
    ageFrozen: false,
    talent: Math.floor(Math.random() * 100) + 1,
    maxDungeonFloor: 1
};

// =========================
// 好友数据
// =========================
let friends = [
    { name: "张霖牧", job: "剑修", favor: 30, chat: "师弟/妹，修炼遇到困难随时叫我！" },
    { name: "周穂", job: "医修", favor: 30, chat: "受伤了记得找我，我给你疗伤~" }
];

// =========================
// 玩家成就记录
// =========================
let playerAchievements = [];

// =========================
// 游戏状态
// =========================
let gameReady = false;
let currentMsg = "";

// =========================
// 白玉京状态
// =========================
let baiYuJingOpen = false;
let baiYuJingWins = 0;
let baiYuJingEnemies = [];

// =========================
// 世界BOSS
// =========================
let worldBoss = null;

// =========================
// 辅助函数
// =========================
function getNeedExp() { 
    return needExp[player.realmIdx]; 
}

function rootEff() { 
    return ROOT_BONUS[player.rootType]; 
}

function cultBonus() {
    let base = 0.8 + player.learn / 500 + player.profExp / 800;
    if (player.skillTier > 0) base *= 1 + player.skillTier * 0.05;
    return Math.min(2.5, base) * rootEff();
}

function generateElements(rootType) {
    let base = ["金", "木", "水", "火", "土"];
    let mutate = ["雷", "冰", "风", "毒", "暗", "光"];
    let shuffle = arr => arr.sort(() => Math.random() - 0.5);
    
    if (rootType <= 0) return shuffle([...base]).slice(0, 5);
    if (rootType === 1) return shuffle([...base]).slice(0, 4);
    if (rootType === 2) return shuffle([...base]).slice(0, 3);
    if (rootType === 3) return shuffle([...base]).slice(0, 2);
    if (rootType === 4 || rootType === 5) return [base[Math.floor(Math.random() * base.length)]];
    if (rootType === 6) return [mutate[Math.floor(Math.random() * mutate.length)]];
    if (rootType === 7) {
        let all = [...base, ...mutate];
        return shuffle(all).slice(0, 2);
    }
    return ["金"];
}

function calcPower() {
    let realmPower = (player.realmIdx + 1) * 120;
    let rootPower = ROOT_BONUS[player.rootType] * 180;
    let equipPower = player.equipped ? EQUIP_POWER[player.equipped.tier] || 0 : 0;
    let skillPower = player.skillLevel * 35;
    let petPower = player.pet ? 120 : 0;
    let famePower = player.fame * 2;
    return Math.floor(realmPower + rootPower + equipPower + skillPower + petPower + famePower);
}

function getAttrRank(value) {
    if (value >= 98) return { text: "仙人转世", color: "#ff4444" };
    if (value >= 90) return { text: "绝世天骄", color: "#ff8800" };
    if (value >= 75) return { text: "天纵奇才", color: "gold" };
    if (value >= 60) return { text: "天资卓绝", color: "#cc66ff" };
    if (value >= 40) return { text: "百里挑一", color: "#66aaff" };
    if (value >= 20) return { text: "略有灵性", color: "#66cc66" };
    if (value >= 10) return { text: "资质平平", color: "#cccccc" };
    return { text: "凡俗之姿", color: "#777777" };
}

function getTalentTitle() {
    return getAttrRank(player.talent).text;
}

function getSkillDamageBonus() {
    let bonus = 1;
    if (player.mainSkill && player.mainSkill.bonus?.damage) {
        bonus += player.mainSkill.bonus.damage;
    }
    bonus += player.skillLevel * 0.05;
    return bonus;
}

function getSkillCritRate() {
    let rate = 0.15;
    if (player.mainSkill && player.mainSkill.bonus?.crit) {
        rate += player.mainSkill.bonus.crit;
    }
    return rate;
}

function getLifeSteal() {
    if (player.mainSkill && player.mainSkill.bonus?.lifeSteal) {
        return player.mainSkill.bonus.lifeSteal;
    }
    return 0;
}

function getElementAdvantage(attacker, defender) {
    let bonus = 1;
    for (let a of attacker) {
        for (let d of defender) {
            if (ELEMENT_COUNTER[a] === d) bonus += 0.25;
            if (ELEMENT_COUNTER[d] === a) bonus -= 0.15;
        }
    }
    return Math.max(0.7, bonus);
}

function generateMonster(name) {
    let data = MONSTERS[name];
    if (!data) return null;
    return {
        name: name,
        hp: data.hp,
        maxHp: data.hp,
        attack: data.attack,
        reward: data.reward,
        exp: data.exp,
        elements: data.elements,
        critRate: data.critRate || 0.1,
        critDamage: 2,
        isBoss: data.isBoss || false,
        buffs: [],
        power: data.attack + Math.floor(data.hp / 10)
    };
}

function getRandomMonster() {
    let names = Object.keys(MONSTERS);
    let name = names[Math.floor(Math.random() * names.length)];
    return generateMonster(name);
}

function createWorldBoss() {
    let bossNames = ["九幽魔龙", "太古雷凰"];
    let name = bossNames[Math.floor(Math.random() * bossNames.length)];
    let boss = generateMonster(name);
    boss.maxHp = boss.hp;
    return boss;
}

function generateTianjiao() {
    let names = ["天剑圣子", "万法道女", "修罗魔子"];
    let name = names[Math.floor(Math.random() * names.length)];
    let tianjiao = generateMonster(name);
    tianjiao.hp += player.realmIdx * 200;
    tianjiao.attack += player.realmIdx * 35;
    tianjiao.power = tianjiao.attack + Math.floor(tianjiao.hp / 10);
    return tianjiao;
}