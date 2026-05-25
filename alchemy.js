// =========================
// 炼丹炼器相关动作
// =========================

function alchemyAction() {
    if (player.stones < 50) { addEvent("灵石不足50", false); return; }
    player.stones -= 50;
    let qualities = [
        { name: "废丹", heal: 10, rate: 25 }, { name: "普通", heal: 40, rate: 35 },
        { name: "精品", heal: 80, rate: 20 }, { name: "极品", heal: 150, rate: 12 },
        { name: "丹纹", heal: 260, rate: 6 }, { name: "仙丹", heal: 500, rate: 2 }
    ];
    let roll = Math.random() * 100, total = 0, result = qualities[0];
    for (let q of qualities) { total += q.rate; if (roll <= total) { result = q; break; } }
    player.inventory.push({ id: "pill", name: `${result.name}回血丹`, category: "consumable", effect: { type: "heal", value: result.heal } });
    addEvent(`⚗️ 炼丹成功！获得【${result.name}回血丹】`, true);
}

function craftAction() {
    if (player.stones < 80) { addEvent("灵石不足80", false); return; }
    player.stones -= 80;
    if (Math.random() < 0.4) {
        let weapon = JOB_WEAPONS[JOB_LIST[player.jobIdx]]?.["凡品"];
        if (weapon) player.inventory.push({ name: weapon, tier: "凡品", job: JOB_LIST[player.jobIdx], category: "weapon" });
        addEvent("🔨炼器成功！", true);
    } else addEvent("🔨炼器失败", false);
}

function washRootAction() {
    if (player.washCount >= 5) { addEvent("洗灵丹已达上限5次", false); return; }
    if (player.stones < 2000) { addEvent("灵石不足2000", false); return; }
    player.stones -= 2000;
    player.washCount++;
    let oldRoot = player.rootType;
    let newRoot = Math.floor(Math.random() * ROOTS.length);
    player.rootType = Math.max(oldRoot, newRoot);
    player.elements = generateElements(player.rootType);
    addEvent(`💊服用洗灵丹，灵根变为${ROOTS[player.rootType]}·${player.elements.join("/")}系`, true);
}