// =========================
// 宗门相关动作
// =========================

function sectWarAction() {
    if (!player.currentSect) return;
    if (Math.random() < 0.5) {
        let reward = 200 + Math.random() * 300;
        player.stones += reward;
        player.fame += 10;
        player.contribution += 20 + Math.floor(Math.random() * 30);
        addEvent(`⚔️宗门战大胜！灵石+${Math.floor(reward)}`, true);
    } else addEvent("⚔️宗门战惜败", false);
}

function promoteRankAction() {
    let next = player.rankIdx + 1;
    if (next >= RANKS.length) { addEvent("已达最高职阶", false); return; }
    if (player.realmIdx < RANKS[next].needRealmIdx) { addEvent(`境界不足，需要${REALMS[RANKS[next].needRealmIdx]}`, false); return; }
    if (player.contribution < RANKS[next].needContribution) { addEvent(`贡献不足${RANKS[next].needContribution}`, false); return; }
    player.rankIdx = next;
    addEvent(`🎉 晋升为【${RANKS[next].name}】！`, true);
}

function getRankByRoot() {
    let r = player.rootType;
    if (r <= 1) return 0;
    if (r === 2) return 1;
    if (r === 3) return 2;
    return 3;
}

function giveStarterWeapon() {
    let weapon = JOB_WEAPONS[JOB_LIST[player.jobIdx]]?.["下品"];
    if (weapon) { 
        player.inventory.push({ name: weapon, tier: "下品", job: JOB_LIST[player.jobIdx], category: "weapon" }); 
        addEvent(`🎁 获得职业专属武器【${weapon}】（下品）！`, true); 
    }
}
