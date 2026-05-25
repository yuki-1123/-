// =========================
// 存档版本号
// =========================
const SAVE_VERSION = 1;
const SAVE_KEY = "xiuxian_action_final";

// =========================
// 保存游戏
// =========================
function saveGame() {
    const saveData = {
        version: SAVE_VERSION,
        player: player,
        friends: friends,
        playerAchievements: playerAchievements,
        gameReady: gameReady,
        baiYuJingOpen: baiYuJingOpen,
        baiYuJingWins: baiYuJingWins,
        baiYuJingEnemies: baiYuJingEnemies,
        worldBoss: worldBoss,
        rankings: rankings,
        worldGeniuses: worldGeniuses
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

// =========================
// 加载游戏
// =========================
function loadGame() {
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    
    try {
        let data = JSON.parse(raw);
        
        // 版本兼容处理
        if (data.version !== SAVE_VERSION) {
            console.log("存档版本不匹配，尝试兼容加载");
        }
        
        player = { ...player, ...data.player };
        friends = data.friends || friends;
        playerAchievements = data.playerAchievements || [];
        gameReady = data.gameReady || false;
        baiYuJingOpen = data.baiYuJingOpen || false;
        baiYuJingWins = data.baiYuJingWins || 0;
        baiYuJingEnemies = data.baiYuJingEnemies || [];
        worldBoss = data.worldBoss || createWorldBoss();
        rankings = data.rankings || rankings;
        worldGeniuses = data.worldGeniuses || [];
        
        // 确保buff数组存在
        if (!player.buffs) player.buffs = [];
        
        updateUI();
        return true;
    } catch (e) {
        console.error("加载存档失败:", e);
        return false;
    }
}