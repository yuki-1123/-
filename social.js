// =========================
// 社交相关动作
// =========================

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

function giveGift() {
    if (!gameReady) return;
    let html = GIFT_ITEMS.map(g => `<button class="choice-btn" data-cost="${g.cost}" data-favor="${g.addFavor}" data-name="${g.name}">🎁${g.name} (${g.cost}灵石, +${g.addFavor}好感)</button>`).join('');
    let modal = createModal("🎁 选择礼物", html + '<button class="choice-btn" id="closeGift">取消</button>');
    document.querySelectorAll("[data-cost]").forEach(btn => {
        btn.onclick = () => {
            let cost = parseInt(btn.getAttribute("data-cost"));
            let favorGain = parseInt(btn.getAttribute("data-favor"));
            let name = btn.getAttribute("data-name");
            if (player.stones < cost) addEvent("灵石不足", false);
            else {
                player.stones -= cost;
                player.favor += favorGain;
                friends.forEach(f => f.favor += favorGain);
                addEvent(`赠送 ${name}，好感+${favorGain}`, true);
            }
            document.body.removeChild(modal);
        };
    });
    document.getElementById("closeGift").onclick = () => document.body.removeChild(modal);
}

function becomePartner() {
    if (player.partner) { addEvent("已有道侣", false); return; }
    let target = friends[0];
    if (target.favor < 120) { addEvent("对方好感不足120", false); return; }
    player.partner = target.name;
    player.partnerElements = generateElements(Math.floor(Math.random() * ROOTS.length));
    addEvent(`💍 与 ${target.name} 结为道侣！对方灵根:${player.partnerElements.join("/")}系`, true);
}

function showFriendChat() {
    let msg = "👥好友圈\n";
    friends.forEach(f => msg += `${f.name}(${f.job}) 好感${Math.floor(f.favor)}\n`);
    alert(msg);
}