// =========================
// 时辰推进
// =========================
function passTime() {
    player.hour++;
    if (player.hour >= 12) {
        player.hour = 0;
        nextDay();
    }
    updateUI();
}

function wrapAP(actionFunc) {
    return () => {
        doAction(actionFunc);
        passTime();
    };
}

// =========================
// 世界事件检查
// =========================
function checkWorldEvents() {
    if (player.day > 0 && player.day % (3 * 365) === 0) {
        addWorldLog("🏆 三年一届【修仙大会】开启！", true);
        player.stones += 3000;
        player.fame += 50;
    }
    if (player.day > 0 && player.day % (5 * 365) === 0 && !baiYuJingOpen) {
        startBaiYuJing();
    }
}

function startBaiYuJing() {
    baiYuJingOpen = true;
    baiYuJingWins = 0;
    baiYuJingEnemies = [];
    addWorldLog("🌌 五年一届【白玉京峰台会】开启！", true);
    addWorldLog("⚔️ 天下圣子齐聚白玉京！", true);
}

function baiYuJingBattle() {
    if (!baiYuJingOpen) { addEvent("白玉京尚未开启", false); return; }
    if (player.realmIdx < 22) { addEvent("至少达到元婴境才能参加白玉京", false); return; }
    
    let enemy = generateTianjiao();
    addBattleLog(`⚔️ 遭遇天骄【${enemy.name}】`, false);
    addBattleLog(`📈 战力：${enemy.power}`, false);
    
    const result = CombatSystem.startBattle(player, enemy);
    result.logs.forEach(r => addBattleLog(r, false));
    
    if (result.win) {
        baiYuJingWins++;
        player.baiYuJingWins = baiYuJingWins;
        CombatSystem.giveReward(player, enemy);
        addEvent(`🏆 白玉京胜场 +1`, true);
        if (baiYuJingWins === 3) { player.highStones += 3; addEvent("💎 三连胜！获得3上品灵石", true); }
        if (baiYuJingWins >= 5 && !player.honorTitle) { player.honorTitle = "白玉京道子"; addEvent("👑 获得尊号【白玉京道子】", true); }
    } else {
        addEvent("💀 白玉京落败", false);
        player.hp = Math.max(1, player.hp * 0.4);
    }
}

function endBaiYuJing() {
    if (!baiYuJingOpen) return;
    baiYuJingOpen = false;
    addEvent(`🌌 白玉京关闭，本届胜场：${baiYuJingWins}`, true);
    if (baiYuJingWins >= 10) { player.highStones += 10; addEvent("🏆 名列潜龙榜！奖励10上品灵石", true); }
}

function generateWorldGenius() {
    const names = ["顾长林", "许曜", "季玄清", "楚筱", "王霖轩", "林棋", "裴修", "姜屿", "陈青璇", "苏牧舟"];
    worldGeniuses.push({
        name: names[Math.floor(Math.random() * names.length)],
        power: 500 + Math.floor(Math.random() * 300),
        realm: REALMS[Math.floor(Math.random() * 15)],
        growth: 20 + Math.floor(Math.random() * 40),
        wins: 0
    });
}

function showBaiYuJingRank() {
    let rankData = [...worldGeniuses].sort((a,b)=>b.power-a.power).slice(0,10);
    let html = `<h3>🌌 白玉京天骄榜</h3>`;
    rankData.forEach((g,i)=>{
        html += `<div class="forum-post"><div class="forum-title">#${i+1} ${g.name}</div><div class="forum-content">⚔️战力：${g.power}<br>🏔️境界：${g.realm}<br>🏆胜场：${g.wins}</div></div>`;
    });
    let modal = createModal("🌌 白玉京排行榜", html + `<button class="choice-btn" id="closeRank">关闭</button>`);
    document.getElementById("closeRank").onclick = () => document.body.removeChild(modal);
}

// =========================
// 下一天
// =========================
function nextDay() {
    if (!gameReady) return;
    if (player.actionPoints === 7) { addEvent("今日尚未行动，无需进入下一天", false); return; }
    player.day++;
    player.actionPoints = 7;
    
    if (player.day % 365 === 0 && !player.ageFrozen) player.age++;
    if (player.age >= player.lifeSpan) {
        addEvent("☠️ 寿元已尽，坐化而亡", false);
        setTimeout(() => { localStorage.removeItem(SAVE_KEY); location.reload(); }, 2000);
        return;
    }
    
    // 成年礼
    if (player.age === 18) {
        addEvent("🎂 今日成年，好友们为你举办了成人礼！", true);
        friends.forEach(f => {
            if (f.favor >= 50) {
                let roll = Math.random();
                if (roll < 0.4) {
                    let attrs = ["learn", "comprehension", "luck", "body", "charm"];
                    let attr = attrs[Math.floor(Math.random() * attrs.length)];
                    let gain = Math.floor(Math.random() * 5) + 1;
                    player[attr] = Math.min(1000, player[attr] + gain);
                    addEvent(`🎁 ${f.name} 赠与你感悟，${attr}+${gain}`, true);
                } else if (roll < 0.7) {
                    let stone = Math.floor(Math.random() * 500) + 100;
                    player.stones += stone;
                    addEvent(`💎 ${f.name} 赠送${stone}灵石`, true);
                } else {
                    let job = JOB_LIST[player.jobIdx];
                    let weapon = JOB_WEAPONS[job]?.["凡品"];
                    if (weapon) {
                        player.inventory.push({ name: weapon, tier: "凡品", category: "weapon" });
                        addEvent(`⚔️ ${f.name} 赠送你【${weapon}】`, true);
                    }
                }
            }
        });
    }
    
    worldGeniuses.forEach(g => g.power += g.growth);
    if (Math.random() < 0.02) { generateWorldGenius(); addWorldLog("🌍 修仙界诞生新的天骄", true); }
    npcSects.forEach(s => s.resource += Math.floor(Math.random() * 100));
    
    autoRecover();
    checkWorldEvents();
    if (baiYuJingOpen && player.day % (5 * 365) === 7) endBaiYuJing();
    
    if (player.day % 30 === 0) {
        let salary = 60 + (player.rankIdx * 20);
        player.stones += salary;
        addEvent(`📅 第${player.day}天，领取月俸${salary}灵石`, true);
    }
    addEvent(`🌙 进入第${player.day}天，状态已恢复`, true);
    saveGame();
    updateUI();
}

// =========================
// 修炼动作
// =========================
function cultivateAction() {
    let gain = Math.floor((15 + Math.random() * 35) * cultBonus());
    let realmPenalty = 1 / (1 + player.realmIdx * 0.035);
    gain *= realmPenalty;
    gain = Math.max(1, Math.floor(gain));
    player.cultivation = Math.min(getNeedExp(), player.cultivation + gain);
    player.skillExp += 5;
    addEvent(`🌿吐纳+${gain}修为，功法感悟+5`, true);
}

function adventureAction() {
    let floor = Math.max(1, player.maxDungeonFloor);
    let monster = getRandomMonster();
    monster.hp = Math.floor(monster.hp * (1 + floor * 0.15));
    monster.attack = Math.floor(monster.attack * (1 + floor * 0.12));
    monster.reward = Math.floor(monster.reward * (1 + floor * 0.2));
    addEvent(`🗺️ 进入秘境第${floor}层`, true);
    battle(monster);
    if (Math.random() < 0.4) { player.maxDungeonFloor++; addEvent(`⬇️ 深入秘境！当前层数 ${player.maxDungeonFloor}`, true); }
    if (Math.random() < 0.08) {
        let tiers = ["凡品", "下品", "中品", "上品", "极品"];
        if (floor >= 20) tiers.push("仙级");
        if (floor >= 35) tiers.push("神级");
        let tier = tiers[Math.floor(Math.random() * tiers.length)];
        let weapon = JOB_WEAPONS[JOB_LIST[player.jobIdx]]?.[tier];
        if (weapon) { player.inventory.push({ name: weapon, tier, job: JOB_LIST[player.jobIdx], category: "weapon" }); addEvent(`🎁 掉落【${weapon}】(${tier})`, true); }
    }
}

function taskAction() {
    let reward = Math.floor(50 + Math.random() * 120);
    let contributionGain = Math.floor(5 + Math.random() * 15);
    player.stones += reward;
    player.fame += 2;
    player.contribution += contributionGain;
    addEvent(`📜任务完成，灵石+${reward}，贡献+${contributionGain}`, true);
}

function interactAction() {
    let f = friends[0];
    let add = 5 + Math.random() * 10;
    f.favor += add;
    player.favor += add;
    addEvent(`💬与${f.name}论道：“${f.chat}” 好感+${Math.floor(add)}`, true);
}

function bathAction() {
    let gain = Math.floor(Math.random() * 3) + 1;
    player.charm = Math.min(1000, player.charm + gain);
    addEvent(`🛁 沐浴焚香，魅力+${gain}`, true);
}