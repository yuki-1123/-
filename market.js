// =========================
// 市场相关动作
// =========================

function marketAction() {
    let modal = createModal("🏮 修仙坊市", `
        <button class="choice-btn" id="buyHpDan">💊回血丹（80灵石）</button>
        <button class="choice-btn" id="buyMpDan">🔷聚灵丹（100灵石）</button>
        <button class="choice-btn" id="closeMarket">关闭</button>
    `);
    document.getElementById("buyHpDan").onclick = () => {
        if (player.stones < 80) { addEvent("灵石不足", false); return; }
        player.stones -= 80;
        player.inventory.push({ id: "hp_pill", name: "回血丹", category: "consumable", effect: { type: "heal", value: 80 } });
        addEvent("购买回血丹成功", true);
        document.body.removeChild(modal);
    };
    document.getElementById("buyMpDan").onclick = () => {
        if (player.stones < 100) { addEvent("灵石不足", false); return; }
        player.stones -= 100;
        player.inventory.push({ id: "mp_pill", name: "聚灵丹", category: "consumable", effect: { type: "mp", value: 60 } });
        addEvent("购买聚灵丹成功", true);
        document.body.removeChild(modal);
    };
    document.getElementById("closeMarket").onclick = () => document.body.removeChild(modal);
}

function auctionAction() {
    let items = [{ name: "轩辕剑", price: 3000 }, { name: "九转金丹", price: 2500 }, { name: "太古残卷", price: 5000 }, { name: "神秘兽蛋", price: 4000 }];
    let item = items[Math.floor(Math.random() * items.length)];
    let modal = createModal("🏛️ 万宝拍卖会", `
        <p>今日拍卖：</p><h3>${item.name}</h3><p>起拍价：${item.price}灵石</p>
        <button class="choice-btn" id="bidBtn">竞拍</button>
        <button class="choice-btn" id="closeAuction">离开</button>
    `);
    document.getElementById("bidBtn").onclick = () => {
        if (player.stones < item.price) { addEvent("灵石不足", false); return; }
        if (Math.random() < 0.35) addEvent("💢 被其他修士抢走了", false);
        else { player.stones -= item.price; player.inventory.push({ name: item.name, tier: "极品", category: "treasure" }); addEvent(`🏛️ 成功拍下【${item.name}】`, true); }
        document.body.removeChild(modal);
    };
    document.getElementById("closeAuction").onclick = () => document.body.removeChild(modal);
}

function bankAction() {
    let modal = createModal("🏦 天机钱庄", `
        <p>当前存款：${Math.floor(player.bankStone)}下品灵石</p>
        <button class="choice-btn" id="save100">存入100灵石</button>
        <button class="choice-btn" id="take100">取出100灵石</button>
        <button class="choice-btn" id="closeBank">关闭</button>
    `);
    document.getElementById("save100").onclick = () => {
        if (player.stones < 100) { addEvent("灵石不足100", false); return; }
        player.stones -= 100; player.bankStone += 100; addEvent("🏦 存入100灵石", true);
        document.body.removeChild(modal);
    };
    document.getElementById("take100").onclick = () => {
        if (player.bankStone < 100) { addEvent("存款不足", false); return; }
        player.bankStone -= 100; player.stones += 100; addEvent("🏦 取出100灵石", true);
        document.body.removeChild(modal);
    };
    document.getElementById("closeBank").onclick = () => document.body.removeChild(modal);
}

function exchangeStone() {
    if (player.stones < 1000) { addEvent("下品灵石不足1000", false); return; }
    player.stones -= 1000;
    player.highStones += 1;
    addEvent("💎 兑换成功：1000下品 → 1上品", true);
}

function gambleAction() {
    if (player.stones < 10) { addEvent("至少需要10下品灵石", false); return; }
    player.stones -= 10;
    let roll = Math.floor(Math.random() * 6) + 1;
    if (roll >= 4) { player.stones += 100; addEvent(`🎲 骰子=${roll}，猜大成功！获得100灵石`, true); }
    else addEvent(`🎲 骰子=${roll}，猜大失败`, false);
}