// =========================
// 事件绑定
// =========================
function bindEvents() {
    document.getElementById("cultivateBtn").onclick = wrapAP(cultivateAction);
    document.getElementById("adventureBtn").onclick = wrapAP(adventureAction);
    document.getElementById("taskBtn").onclick = wrapAP(taskAction);
    document.getElementById("interactBtn").onclick = wrapAP(interactAction);
    document.getElementById("giftBtn").onclick = wrapAP(giveGift);
    document.getElementById("alchemyBtn").onclick = wrapAP(alchemyAction);
    document.getElementById("craftBtn").onclick = wrapAP(craftAction);
    document.getElementById("libraryBtn").onclick = wrapAP(libraryAction);
    document.getElementById("forumBtn").onclick = () => { if (gameReady) showForum(); };
    document.getElementById("breakBtn").onclick = wrapAP(breakthroughAction);
    document.getElementById("washRootBtn").onclick = wrapAP(washRootAction);
    document.getElementById("mortalEventBtn").onclick = wrapAP(mortalEventAction);
    document.getElementById("sectWarBtn").onclick = wrapAP(sectWarAction);
    document.getElementById("bossBtn").onclick = wrapAP(bossAction);
    document.getElementById("promoteRankBtn").onclick = wrapAP(promoteRankAction);
    document.getElementById("nextDayBtn").onclick = () => { if (gameReady) nextDay(); };
    document.getElementById("bagBtn").onclick = () => { if (gameReady) showBag(); };
    document.getElementById("friendListBtn").onclick = () => { if (gameReady) showFriendChat(); };
    document.getElementById("achievementBtn").onclick = () => { if (gameReady) showAchievements(); };
    document.getElementById("saveBtn").onclick = () => { if (gameReady) { saveGame(); addEvent("💾手动存档成功", true); } };
    document.getElementById("loadBtn").onclick = () => { if (loadGame()) addEvent("📀读档成功", true); else addEvent("无存档", false); };
    document.getElementById("exportBtn").onclick = () => { let a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([localStorage.getItem(SAVE_KEY) || ""])); a.download = "xiuxian_save.json"; a.click(); addEvent("📤存档导出", true); };
    document.getElementById("importBtn").onclick = () => { let inp = document.createElement("input"); inp.type = "file"; inp.onchange = e => { let f = e.target.files[0]; let r = new FileReader(); r.onload = ev => { localStorage.setItem(SAVE_KEY, ev.target.result); loadGame(); addEvent("📥导入并读取成功", true); }; r.readAsText(f); }; inp.click(); };
    document.getElementById("clearSaveBtn").onclick = () => { localStorage.removeItem(SAVE_KEY); addEvent("🗑️存档已清除", true); };
    document.getElementById("resetBtn").onclick = () => { if (confirm("轮回重修？进度将丢失")) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
    document.getElementById("doubleCultBtn").onclick = wrapAP(doubleCultivationAction);
    document.getElementById("marketBtn").onclick = () => { if (gameReady) marketAction(); };
    document.getElementById("partnerBtn").onclick = wrapAP(becomePartner);
    document.getElementById("rankBtn").onclick = () => { if (gameReady) showRanking(); };
    document.getElementById("upgradeSkillBtn").onclick = wrapAP(upgradeSkill);
    document.getElementById("bankBtn").onclick = () => { if (gameReady) bankAction(); };
    document.getElementById("exchangeBtn").onclick = () => { if (gameReady) exchangeStone(); };
    document.getElementById("gambleBtn").onclick = wrapAP(gambleAction);
    document.getElementById("baiyujingBtn").onclick = wrapAP(baiYuJingBattle);
    document.getElementById("auctionBtn").onclick = wrapAP(auctionAction);
    document.getElementById("baiRankBtn").onclick = () => { if (gameReady) showBaiYuJingRank(); };
    document.getElementById("bathBtn").onclick = wrapAP(bathAction);
}

// =========================
// 自动修为增长
// =========================
setInterval(() => {
    if (!gameReady) return;
    let gain = Math.floor(1 + rootEff() * 2);
    player.cultivation = Math.min(getNeedExp(), player.cultivation + gain);
    updateUI();
}, 10000);

// =========================
// 启动游戏
// =========================
window.onload = function () {

    bindEvents();

    if (loadGame() && player.name && player.currentSect) {
        updateUI();
        addEvent("📀 读取存档成功", true);
    } else {
        localStorage.removeItem(SAVE_KEY);

        player.age = 12;
        player.day = 1;
        player.hour = 3;

        startNewGame();
    }

};