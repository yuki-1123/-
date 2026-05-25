// =========================
// 修炼相关动作
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

function breakthroughAction() {
    if (player.cultivation < getNeedExp()) { addEvent("修为不足", false); return; }
    if (player.realmIdx >= REALMS.length - 1) { addEvent("大乘圆满，飞升成仙！", true); return; }
    let rate = Math.min(90, 45 + player.luck + player.learn * 0.03);
    if (Math.random() * 100 < rate) {
        let surplus = player.cultivation - getNeedExp();
        player.realmIdx++;
        player.cultivation = Math.min(surplus, getNeedExp());
        player.hp = baseHp[player.realmIdx];
        player.mp = baseMp[player.realmIdx];
        if (player.realmIdx >= 18) player.lifeSpan += 30;
        if (player.realmIdx >= 22) player.lifeSpan += 80;
        if (player.realmIdx >= 25) player.lifeSpan += 300;
        if (player.realmIdx >= 29) player.lifeSpan += 500;
        if (player.realmIdx >= 33) player.lifeSpan += 1000;
        if (player.realmIdx >= 25) player.ageFrozen = true;
        addEvent(`✨突破成功！晋升至 ${REALMS[player.realmIdx]} ✨`, true);
        checkAchievement();
        checkHonorTitle();
    } else {
        player.cultivation = Math.max(0, player.cultivation * 0.85);
        addEvent("💢突破失败，修为跌落", false);
    }
}

function doubleCultivationAction() {
    if (!player.partner) { addEvent("尚无道侣，无法双修", false); return; }
    if (player.favor < 100) { addEvent("好感不足100，无法双修", false); return; }
    let gain = Math.floor(80 + Math.random() * 120);
    let bonus = 1;
    if (player.partnerElements) {
        if (player.elements.includes("水") && player.partnerElements.includes("木")) bonus += 0.25;
        if (player.elements.includes("雷") && player.partnerElements.includes("火")) bonus += 0.35;
        if (player.elements.includes("光") && player.partnerElements.includes("暗")) bonus += 0.5;
        for (let e of player.elements) if (player.partnerElements.includes(e)) bonus += 0.15;
    }
    gain *= bonus;
    player.cultivation = Math.min(getNeedExp(), player.cultivation + gain);
    player.mp += 30;
    addEvent(`💞 与道侣神魂交融，修为+${Math.floor(gain)}`, true);
}

function nextDay() {
    if (!gameReady) return;
    if (player.actionPoints === player.maxActionPoints) { 
        addEvent("今日尚未行动，无需进入下一天", false); 
        return; 
    }
    player.day++;
    player.actionPoints = player.maxActionPoints;
    
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

function adventureAction() {
    let floor = Math.max(1, player.maxDungeonFloor);
    let monster = getRandomMonster();
    monster.hp = Math.floor(monster.hp * (1 + floor * 0.15));
    monster.attack = Math.floor(monster.attack * (1 + floor * 0.12));
    monster.reward = Math.floor(monster.reward * (1 + floor * 0.2));
    addEvent(`🗺️ 进入秘境第${floor}层`, true);
    battle(monster);
    if (Math.random() < 0.4) { 
        player.maxDungeonFloor++; 
        addEvent(`⬇️ 深入秘境！当前层数 ${player.maxDungeonFloor}`, true); 
    }
    if (Math.random() < 0.08) {
        let tiers = ["凡品", "下品", "中品", "上品", "极品"];
        if (floor >= 20) tiers.push("仙级");
        if (floor >= 35) tiers.push("神级");
        let tier = tiers[Math.floor(Math.random() * tiers.length)];
        let weapon = JOB_WEAPONS[JOB_LIST[player.jobIdx]]?.[tier];
        if (weapon) { 
            player.inventory.push({ name: weapon, tier, job: JOB_LIST[player.jobIdx], category: "weapon" }); 
            addEvent(`🎁 掉落【${weapon}】(${tier})`, true); 
        }
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

function bossAction() {
    if (!worldBoss) worldBoss = createWorldBoss();
    let damage = Math.floor(calcPower() * (0.8 + Math.random() * 0.5));
    worldBoss.hp -= damage;
    if (worldBoss.hp < 0) worldBoss.hp = 0;
    player.totalBossDamage += damage;
    player.stones += Math.floor(damage / 10);
    addEvent(`⚔️ 对${worldBoss.name}造成${damage}伤害`, true);
    if (worldBoss.hp <= 0) {
        player.stones += worldBoss.reward;
        player.highStones += 2;
        addWorldLog(`🐉 世界Boss【${worldBoss.name}】被斩杀！`, true);
        rankings.push({ name: player.name + (player.honorTitle ? `·${player.honorTitle}` : ""), power: calcPower() });
        worldBoss = createWorldBoss();
    }
    updateBossUI();
}

function mortalEventAction() {
    let gain = 30 + Math.random() * 80;
    player.stones += gain;
    addEvent(`🏮凡界奇遇：获得${Math.floor(gain)}灵石`, true);
}

function libraryAction() {
    if (player.stones < 100) { addEvent("灵石不足100", false); return; }
    player.stones -= 100;
    let gain = 5 + Math.random() * 15;
    player.learn = Math.min(1000, player.learn + gain);
    if (Math.random() < 0.15) learnSkillAction();
    else addEvent(`📚研习经典，学问+${Math.floor(gain)}`, true);
}
