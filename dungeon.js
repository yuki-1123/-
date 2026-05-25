// =========================
// 地牢/游戏初始化相关动作
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
        addEvent(`灵根【${ROOTS[player.rootType]}·${player.elements.join("/")}系】 | 资质【${getTalentTitle()}】(${player.talent})`, true);
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