// =========================
// 功法技能相关动作
// =========================

function learnSkillAction() {
    let job = JOB_LIST[player.jobIdx];
    let candidates = Object.keys(SKILLS).filter(name => SKILLS[name].job === job);
    if (candidates.length === 0) { addEvent("暂无可学习技能", false); return; }
    let skillName = candidates[Math.floor(Math.random() * candidates.length)];
    let skill = { name: skillName, ...SKILLS[skillName] };
    if (player.skills.some(s => s.name === skillName)) { addEvent(`已掌握 ${skillName}`, false); return; }
    player.skills.push(skill);
    if (!player.mainSkill) player.mainSkill = skill;
    addEvent(`📖 学会功法【${skillName}】`, true);
}

function upgradeSkill() {
    if (!player.mainSkill) { addEvent("尚未掌握功法", false); return; }
    let need = player.skillLevel * 100;
    if (player.skillExp < need) { addEvent(`功法感悟不足 ${need}`, false); return; }
    player.skillExp -= need;
    player.skillLevel++;
    player.skillTier += 1;
    addEvent(`✨ ${player.mainSkill.name} 提升至 ${player.skillLevel} 层`, true);
}

function checkComboSkill() {
    if (player.skills.length < 2) return null;
    let skillNames = player.skills.map(s => s.name);
    for (let combo of COMBOS) {
        if (combo.skills.every(skill => skillNames.includes(skill))) return combo;
    }
    return null;
}

function checkAchievement() {
    for (let a of ACHIEVEMENTS) {
        if (player.realmIdx >= a.req && !playerAchievements.includes(a.id)) {
            playerAchievements.push(a.id);
            player.stones += a.stones;
            if (a.pill) player.inventory.push({ id: "pill", name: "回血丹", category: "consumable", effect: { type: "heal", value: 40 } });
            addEvent(`🏆 成就「${a.name}」达成！获得 ${a.stones} 灵石 + 丹药`, true);
        }
    }
}

function checkHonorTitle() {
    if (player.realmIdx >= 26 && !player.honorTitle) {
        let modal = createModal("✨ 尊号封冕 ✨", `
            <p>踏入元婴之境，可为自己加冕尊号</p>
            <input type="text" id="honorInput" class="name-input" placeholder="如：太虚仙尊">
            <div><button class="choice-btn" id="confirmHonor">确认</button><button class="choice-btn" id="skipHonor">暂不</button></div>
        `);
        document.getElementById("confirmHonor").onclick = () => {
            let h = document.getElementById("honorInput").value.trim();
            if (h) player.honorTitle = h;
            document.body.removeChild(modal);
        };
        document.getElementById("skipHonor").onclick = () => document.body.removeChild(modal);
    }
}
