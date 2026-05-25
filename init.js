// =========================
// 辅助函数
// =========================
function getAttrRank(v) {
    if (v >= 100) { return { text: "天命之子", color: "gold" }; }
    if (v >= 80) { return { text: "绝世天骄", color: "#ff66ff" }; }
    if (v >= 60) { return { text: "仙路奇才", color: "#33ccff" }; }
    if (v >= 40) { return { text: "资质尚可", color: "#55dd55" }; }
    if (v >= 20) { return { text: "平平无奇", color: "#cccccc" }; }
    return { text: "废材", color: "#777777" };
}

// =========================
// 核心包装器和通用函数
// =========================

// 时辰推进
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
        const success = doAction(actionFunc);
        if (success) {
            passTime();
        }
    };
}

function doAction(callback) {
    if (!gameReady) return false;
    if (player.actionPoints <= 0) {
        addEvent("行动点不足，请点击「下一天」继续修炼！", false);
        return false;
    }
    callback();
    player.actionPoints--;
    autoRecover();
    saveGame();
    updateUI();
    return true;
}

// 世界事件检查
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

function endBaiYuJing() {
    if (!baiYuJingOpen) return;
    baiYuJingOpen = false;
    addEvent(`🌌 白玉京关闭，本届胜场：${baiYuJingWins}`, true);
    if (baiYuJingWins >= 10) { 
        player.highStones += 10; 
        addEvent("🏆 名列潜龙榜！奖励10上品灵石", true); 
    }
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

function showRanking() {
    rankings.sort((a, b) => b.power - a.power);
    let html = rankings.slice(0, 20).map((r, i) => `<div class="forum-post"><div class="forum-title">#${i + 1} ${r.name}</div><div class="forum-content">⚔️战力：${r.power}</div></div>`).join("");
    let modal = createModal("🏆 天机榜", html + `<button class="choice-btn" id="closeRank">关闭</button>`);
    document.getElementById("closeRank").onclick = () => document.body.removeChild(modal);
}

function showAchievements() {
    if (!playerAchievements.length) alert("暂无成就，突破大境界可获得");
    else alert("🏆成就:\n" + playerAchievements.join("\n"));
}

function showBag() {
    if (!gameReady) return;
    let html = "";
    if (player.inventory.length === 0) html = "<p>空空如也</p>";
    else {
        player.inventory.forEach((item, index) => {
            html += `<div class="forum-post"><div class="forum-title">${item.name}</div><div class="forum-content">品阶：${item.tier || "普通"}</div><button class="choice-btn equip-btn" data-index="${index}">⚔️装备</button></div>`;
        });
    }
    let modal = createModal("🎒 背包", html + `<button class="choice-btn" id="closeBag">关闭</button>`);
    document.querySelectorAll(".equip-btn").forEach(btn => {
        btn.onclick = () => {
            let idx = parseInt(btn.dataset.index);
            let item = player.inventory[idx];
            if (item.category === "weapon") { player.equipped = { ...player.equipped, weapon: item }; addEvent(`⚔️ 装备${item.name}`, true); }
            document.body.removeChild(modal);
            updateUI();
        };
    });
    document.getElementById("closeBag").onclick = () => document.body.removeChild(modal);
}

// =========================
// 游戏初始化弹窗函数
// =========================

function startNewGame() { 
    gameReady = false; 
    showNameModal(); 
}

function showNameModal() {
    let modal = createModal("✨ 入道先正名 ✨", `<input type="text" id="daoNameInput" class="name-input" placeholder="请输入姓名"><button class="choice-btn" id="confirmNameBtn">✅确认</button>`);
    document.getElementById("confirmNameBtn").onclick = () => {
        let name = document.getElementById("daoNameInput").value.trim();
        if (name) player.name = name;
        document.body.removeChild(modal);
        showGenderModal();
    };
}

function showGenderModal() {
    let modal = createModal("⚧ 性别", `<button class="choice-btn" id="male">🧘男修</button><button class="choice-btn" id="female">🌸女修</button>`);
    document.getElementById("male").onclick = () => { player.gender = "男"; document.body.removeChild(modal); showRootTestModal(); };
    document.getElementById("female").onclick = () => { player.gender = "女"; document.body.removeChild(modal); showRootTestModal(); };
}

function showRootTestModal() {
    let modal = createModal("✨ 天机测灵根 ✨", `
        <div id="rootDisplay">${ROOTS[player.rootType]}</div>
        <div>效率×${ROOT_BONUS[player.rootType].toFixed(1)}</div>
        <div>🎲免费重测:${player.rootRerollLeft}/3</div>
        <div>💊洗灵丹:${player.washCount}/5(2000灵石)</div>
        <button class="choice-btn" id="rerootBtn">🔄重测</button>
        <button class="choice-btn" id="washBtn">💊洗灵丹</button>
        <button class="choice-btn" id="acceptBtn">✅确认</button>
    `);
    document.getElementById("rerootBtn").onclick = () => {
        if (player.rootRerollLeft > 0) {
            player.rootRerollLeft--;
            player.rootType = Math.floor(Math.random() * ROOTS.length);
            player.elements = generateElements(player.rootType);
            document.getElementById("rootDisplay").innerHTML = ROOTS[player.rootType];
            modal.children[0].children[3].innerHTML = `🎲免费重测:${player.rootRerollLeft}/3`;
            addEvent(`重测:${ROOTS[player.rootType]}·${player.elements.join("/")}系`, true);
        } else addEvent("免费次数已用完", false);
    };
    document.getElementById("washBtn").onclick = () => {
        if (player.washCount >= 5) addEvent("洗灵丹已达上限5次", false);
        else if (player.stones < 2000) addEvent("灵石不足2000", false);
        else {
            player.stones -= 2000; player.washCount++;
            let oldRoot = player.rootType;
            let newRoot = Math.floor(Math.random() * ROOTS.length);
            player.rootType = Math.max(oldRoot, newRoot);
            player.elements = generateElements(player.rootType);
            document.getElementById("rootDisplay").innerHTML = ROOTS[player.rootType];
            modal.children[0].children[4].innerHTML = `💊洗灵丹:${player.washCount}/5(2000灵石)`;
            addEvent(`洗灵丹：${ROOTS[player.rootType]}·${player.elements.join("/")}系`, true);
        }
    };
    document.getElementById("acceptBtn").onclick = () => {
        player.rankIdx = getRankByRoot();
        player.elements = generateElements(player.rootType);
        addEvent(`灵根【${ROOTS[player.rootType]}·${player.elements.join("/")}系】 | 资质【${getTalentTitle(player.talent)}】(${player.talent})`, true);
        document.body.removeChild(modal);
        showJobModal();
    };
}

function showJobModal() {
    let btns = JOB_LIST.map((j, i) => `<button class="choice-btn" data-job="${i}">${j}</button>`).join('');
    let modal = createModal("📿 选择修真职业", `<div class="job-select-grid">${btns}</div>`);
    JOB_LIST.forEach((j, i) => {
        let btn = modal.querySelector(`[data-job="${i}"]`);
        if (btn) btn.onclick = () => { 
            player.jobIdx = i; 
            addEvent(`选择了【${j}】之路`, true); 
            giveStarterWeapon(); 
            document.body.removeChild(modal); 
            showAttrModal(); 
        };
    });
}

function showAttrModal() {
    let attrs = [
        { key: "learn", name: "📖学问" },
        { key: "comprehension", name: "🧠悟性" },
        { key: "luck", name: "🍀气运" },
        { key: "body", name: "💪体魄" },
        { key: "charm", name: "💘魅力" }
    ];
    let html = "";
    attrs.forEach(attr => {
        player[attr.key] = Math.floor(Math.random() * 100) + 1;
        let rank = getAttrRank(player[attr.key]);
        html += `
        <div style="margin:10px;padding:10px;border:1px solid #666;border-radius:10px;">
            <div id="${attr.key}Text">
                ${attr.name}：
                <span style="color:${rank.color};font-weight:bold;text-shadow:0 0 8px ${rank.color};">
                    ${player[attr.key]}【${rank.text}】
                </span>
            </div>
            <button class="choice-btn" id="${attr.key}Btn">🔄随机</button>
        </div>
        `;
    });
    html += `<button class="choice-btn" id="startGameBtn">✨开始修仙</button>`;
    let modal = createModal("✨ 天资命格 ✨", html);
    attrs.forEach(attr => {
        document.getElementById(attr.key + "Btn").onclick = () => {
            player[attr.key] = Math.floor(Math.random() * 100) + 1;
            let rank = getAttrRank(player[attr.key]);
            document.getElementById(attr.key + "Text").innerHTML = `
                ${attr.name}：
                <span style="color:${rank.color};font-weight:bold;text-shadow:0 0 8px ${rank.color};">
                    ${player[attr.key]}【${rank.text}】
                </span>
            `;
        };
    });
    document.getElementById("startGameBtn").onclick = () => {
        document.body.removeChild(modal);
        showSectModal();
    };
}

function showSectModal() {
    let btns = SECTS.map(s => `<button class="choice-btn" data-sect="${s}">${s}</button>`).join('');
    let modal = createModal("⛩️ 13大宗门", `<div class="job-select-grid">${btns}</div><button class="choice-btn" id="free">🌊散修(资源较少)</button>`);
    SECTS.forEach(s => {
        let btn = modal.querySelector(`[data-sect="${s}"]`);
        if (btn) btn.onclick = () => {
            player.currentSect = s;
            addEvent(`拜入${s}`, true);
            document.body.removeChild(modal);
            gameReady = true;
            player.stones += 60 + (player.rankIdx * 20);
            addEvent(`📅 入门首日月俸${60 + (player.rankIdx * 20)}灵石`, true);
            saveGame();
            updateUI();
        };
    });
    document.getElementById("free").onclick = () => {
        player.currentSect = "散修";
        addEvent("散修之路，资源较少，自在但需努力", true);
        document.body.removeChild(modal);
        gameReady = true;
        saveGame();
        updateUI();
    };
}

// =========================
// 事件绑定（防止重复绑定）
// =========================
let eventsBound = false;

function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;
    
    document.getElementById("cultivateBtn").onclick = wrapAP(cultivateAction);
    document.getElementById("adventureBtn").onclick = wrapAP(adventureAction);
    document.getElementById("taskBtn").onclick = wrapAP(taskAction);
    document.getElementById("interactBtn").onclick = wrapAP(interactAction);
    document.getElementById("giftBtn").onclick = wrapAP(giveGift);
    document.getElementById("alchemyBtn").onclick = wrapAP(alchemyAction);
    document.getElementById("craftBtn").onclick = wrapAP(craftAction);
    document.getElementById("libraryBtn").onclick = wrapAP(libraryAction);
    document.getElementById("forumBtn").onclick = () => { if (gameReady) openForum(); };
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
// 暴露给外部的初始化入口
// =========================
window.showCreatePlayerModal = startNewGame;

// =========================
// 启动游戏（DOMContentLoaded 避免与 window.onload 冲突）
// =========================
document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    if (loadGame() && player && player.name && player.currentSect) {
        updateUI();
        addEvent("📀 读取存档成功", true);
    } else {
        localStorage.removeItem(SAVE_KEY);
        player.age = 12;
        player.day = 1;
        player.hour = 3;
        startNewGame();
    }
});
