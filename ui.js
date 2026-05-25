// =========================
// UI更新函数
// =========================
function updateBaseUI() {
    let p = Math.min(100, player.cultivation / getNeedExp() * 100);
    
    document.getElementById("hpVal").innerText = Math.floor(player.hp);
    document.getElementById("mpVal").innerText = Math.floor(player.mp);
    document.getElementById("powerVal").innerText = calcPower();
    document.getElementById("stoneVal").innerHTML = `${Math.floor(player.stones)}下品 / ${player.highStones}上品`;
    document.getElementById("expPercent").innerText = p.toFixed(0) + "%";
    document.getElementById("expFill").style.width = p + "%";
    
    document.getElementById("rootBadge").innerHTML = `🌿${ROOTS[player.rootType]}·${player.elements.join("/")}系`;
    document.getElementById("sectBadge").innerHTML = "🏔️" + (player.currentSect || "无");
    document.getElementById("jobBadge").innerHTML = "📿" + (JOB_LIST[player.jobIdx] || "未选");
    document.getElementById("petBadge").innerHTML = player.pet ? `🐾${player.pet}` : "🐾无灵宠";
    
    document.getElementById("rankBadge").innerHTML = `🎽${RANKS[player.rankIdx].name} (贡献:${player.contribution})`;
    document.getElementById("luckVal").innerHTML = player.luck;
    document.getElementById("fameVal").innerHTML = player.fame;
    document.getElementById("learnVal").innerHTML = player.learn;
    document.getElementById("profVal").innerHTML = player.profExp;
    document.getElementById("skillTier").innerHTML = player.skillTier;
    document.getElementById("dayDisplay").innerHTML = `📅 第${player.day}天`;
    document.getElementById("apDisplay").innerHTML = `⚡行动点: ${player.actionPoints}/${player.maxActionPoints}`;
    document.getElementById("ageVal").innerHTML = Math.floor(player.age);
    document.getElementById("lifeVal").innerHTML = player.lifeSpan;
    document.getElementById("talentVal").innerHTML = player.talent;
    document.getElementById("floorVal").innerHTML = `${player.maxDungeonFloor}层`;
    document.getElementById("eventMsg").innerHTML = currentMsg;
    document.getElementById("timeDisplay").innerHTML = `🕒 第${player.day}天 · ${HOURS[player.hour]} · ${player.age}岁`;
}

function updateSkillUI() {
    if (player.mainSkill) {
        let cls = "skill-normal";
        if (player.mainSkill.tier === "地阶") cls = "skill-earth";
        if (player.mainSkill.tier === "天阶") cls = "skill-heaven";
        if (player.mainSkill.tier === "神阶") cls = "skill-god";
        if (player.mainSkill.tier === "仙阶") cls = "skill-immortal";
        document.getElementById("skillBadge").innerHTML = `<span class="${cls}">📖${player.mainSkill.name}</span>`;
    } else {
        document.getElementById("skillBadge").innerHTML = "📖无功法";
    }
    document.getElementById("skillLevelVal").innerHTML = `📖${player.skillLevel}层`;
    document.getElementById("skillExpVal").innerHTML = `✨${Math.floor(player.skillExp)}/${player.skillLevel * 100}`;
}

function updateEquipUI() {
    let equipText = "⚔️无装备";
    if (player.equipped && player.equipped.weapon) {
        let weapon = player.equipped.weapon;
        let cls = "";
        if (weapon.tier === "极品") cls = "legendary";
        if (weapon.tier === "仙级") cls = "epic";
        if (weapon.tier === "神级") cls = "god";
        equipText = `<span class="${cls}">⚔️${weapon.name}(${weapon.tier})</span>`;
    }
    document.getElementById("equipBadge").innerHTML = equipText;
}

function updateSocialUI() {
    document.getElementById("genderBadge").innerHTML = "⚧ " + (player.gender || "未选");
    document.getElementById("partnerBadge").innerHTML = player.partner ? `💑道侣:${player.partner}` : "💑道侣:无";
    document.getElementById("favorBadge").innerHTML = `💑好感${Math.floor(player.favor)}`;
    document.getElementById("friendBadge").innerHTML = `👥好友${friends.length}`;
    document.getElementById("honorBadge").innerHTML = player.honorTitle ? `🏅尊号:${player.honorTitle}` : "🏅尊号:无";
}

function updateBossUI() {
    if (!worldBoss || !worldBoss.hp) {
        worldBoss = createWorldBoss();
    }
    if (worldBoss) {
        let percent = (worldBoss.hp / worldBoss.maxHp) * 100;
        document.getElementById("bossHpBar").style.width = percent + "%";
        document.getElementById("bossHpText").innerHTML = `${Math.floor(worldBoss.hp)} / ${worldBoss.maxHp}`;
        document.getElementById("bossName").innerHTML = `🐉世界Boss·${worldBoss.name}`;
    }
}

function updateUI() {
    if (!gameReady) return;
    updateBaseUI();
    updateSkillUI();
    updateEquipUI();
    updateSocialUI();
    updateBossUI();
}

function resetBoss() {
    worldBoss = createWorldBoss();
    updateBossUI();
}

// =========================
// 模态框工厂
// =========================
function createModal(title, content) {
    let modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `<div class="modal-content"><h3>${title}</h3>${content}</div>`;
    document.body.appendChild(modal);
    return modal;
}

// 通用模态框显示（接收HTML字符串）
function showModal(html) {
    let div = document.createElement("div");
    div.className = "modal";
    div.id = "globalModal";
    div.innerHTML = `
        <div class="modal-content">
            ${html}
        </div>
    `;
    document.body.appendChild(div);
}

// 关闭通用模态框
function closeModal() {
    let m = document.getElementById("globalModal");
    if (m) m.remove();
}

// =========================
// 事件日志分类（带日志队列）
// =========================
let eventLogs = [];

function addEvent(msg, good = true) {
    eventLogs.unshift((good ? "✨ " : "💢 ") + msg);
    if (eventLogs.length > 8) {
        eventLogs.pop();
    }
    currentMsg = eventLogs.join("<br>");
    updateUI();
}

function addBattleLog(msg, good = true) {
    addEvent(`⚔️ ${msg}`, good);
}

function addSystemLog(msg, good = true) {
    addEvent(`📀 ${msg}`, good);
}

function addWorldLog(msg, good = true) {
    addEvent(`🌍 ${msg}`, good);
}

// =========================
// 自动恢复
// =========================
function autoRecover() {
    let maxHp = baseHp[player.realmIdx];
    let maxMp = baseMp[player.realmIdx];
    let hpRecover = maxHp * 0.05;
    let mpRecover = maxMp * 0.08;
    
    if (player.partner) {
        hpRecover *= 1.2;
        mpRecover *= 1.2;
    }
    
    player.hp = Math.min(maxHp, player.hp + hpRecover);
    player.mp = Math.min(maxMp, player.mp + mpRecover);
}

// =========================
// 论坛显示（旧版，保留备用）
// =========================
function showForum() {
    let postsHtml = forumPosts.map(p => `
        <div class="forum-post">
            <div class="forum-title">${p.title}</div>
            <div class="forum-meta">✍️ ${p.author}【${p.authorJob}】·👍${p.likes}</div>
            <div class="forum-content">${p.content}</div>
            <div class="reply-area">${p.replies.map(r => `<div class="reply-item"><span class="reply-name">${r.name}【${r.job}】</span>：${r.content}</div>`).join('')}</div>
            <div><button class="choice-btn likeBtn" data-id="${p.id}">👍点赞</button><button class="choice-btn replyBtn" data-id="${p.id}">💬回帖</button></div>
        </div>
    `).join('');
    let modal = createModal("📰 修仙论坛", postsHtml + '<button class="choice-btn" id="closeForum">关闭</button>');
    
    document.querySelectorAll(".likeBtn").forEach(btn => {
        btn.onclick = () => {
            let id = parseInt(btn.getAttribute("data-id"));
            forumPosts[id].likes++;
            addEvent("点赞+1", true);
            document.body.removeChild(modal);
            showForum();
        };
    });
    document.querySelectorAll(".replyBtn").forEach(btn => {
        btn.onclick = () => {
            addEvent("回帖：道友说得有理但不全对", true);
            document.body.removeChild(modal);
            showForum();
        };
    });
    document.getElementById("closeForum").onclick = () => document.body.removeChild(modal);
}
