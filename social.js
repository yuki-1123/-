// =========================
// 社交相关动作
// =========================

// 交友
function interactAction() {
    let f = friends[0];
    let add = 5 + Math.random() * 10;
    f.favor += add;
    player.favor += add;
    addEvent(`💬与${f.name}论道：“${f.chat}” 好感+${Math.floor(add)}`, true);
}

// 沐浴
function bathAction() {
    let gain = Math.floor(Math.random() * 3) + 1;
    player.charm = Math.min(1000, player.charm + gain);
    addEvent(`🛁 沐浴焚香，魅力+${gain}`, true);
}

// 赠礼
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

// 结侣
function becomePartner() {
    if (player.partner) { addEvent("已有道侣", false); return; }
    let target = friends[0];
    if (target.favor < 120) { addEvent("对方好感不足120", false); return; }
    player.partner = target.name;
    player.partnerElements = generateElements(Math.floor(Math.random() * ROOTS.length));
    addEvent(`💍 与 ${target.name} 结为道侣！对方灵根:${player.partnerElements.join("/")}系`, true);
}

// 好友圈
function showFriendChat() {
    let msg = "👥好友圈\n";
    friends.forEach(f => msg += `${f.name}(${f.job}) 好感${Math.floor(f.favor)}\n`);
    alert(msg);
}

// =========================
// 修仙论坛系统加强版
// =========================

let forumPosts = [
    {
        title: "【吐槽】剑修除了帅还会啥？",
        author: "铁拳体修",
        sect: "体修",
        likes: 236,
        content: "脆皮一个，没体修在前面顶着早就躺了！",
        reply: "剑心无悔：你懂什么！一剑破万法！",
        channel: "世界"
    },
    {
        title: "【愤怒】丹修凭什么丹药卖那么贵！",
        author: "穷困剑修",
        sect: "剑修",
        likes: 167,
        content: "一颗回血丹要50灵石？抢钱啊！",
        reply: "丹霞谷小丹：你行你上啊！",
        channel: "世界"
    }
];

// 热搜榜
function getHotTopics() {
    let arr = [...forumPosts];
    arr.sort((a, b) => b.likes - a.likes);
    return arr.slice(0, 5);
}

// 随机帖子
function randomForumPost() {
    const titles = [
        "有人在秘境捡到神品吗？",
        "体修是不是后期最强？",
        "昨天有人渡劫失败了",
        "双修真的能加速修炼？",
        "白玉京到底存不存在？",
        "剑修是不是全员装逼？",
        "丹修赚钱也太离谱了",
        "今天坊市灵石暴涨",
        "有人见过九幽魔龙吗？",
        "哪个宗门妹子最多？"
    ];

    const names = [
        "无情剑仙",
        "摸鱼老祖",
        "摆烂真君",
        "炸炉丹师",
        "摆渡人",
        "夜雨剑客",
        "匿名修士",
        "青云道人",
        "咸鱼天尊",
        "吃瓜群众"
    ];

    const replies = [
        "楼主说得对！",
        "你境界太低不懂。",
        "建议先突破再说。",
        "哈哈哈哈笑死。",
        "我师尊也是这样。",
        "剑修路过。",
        "丹修震怒！",
        "体修永不为奴！",
        "真的假的？",
        "有道理。"
    ];

    const channels = ["世界", "宗门", "热门", "匿名"];

    forumPosts.unshift({
        title: "【讨论】" + titles[Math.floor(Math.random() * titles.length)],
        author: names[Math.floor(Math.random() * names.length)],
        sect: "散修",
        likes: Math.floor(Math.random() * 300),
        content: "听说最近修仙界都在聊这个。",
        reply: replies[Math.floor(Math.random() * replies.length)],
        channel: channels[Math.floor(Math.random() * channels.length)]
    });

    if (forumPosts.length > 30) {
        forumPosts.pop();
    }
}

// 自动NPC回复
function autoReply(post) {
    const names = [
        "暴躁剑修",
        "丹塔长老",
        "摆烂老祖",
        "体修壮汉",
        "青云仙子",
        "路过散修"
    ];

    const texts = [
        "楼主纯扯淡。",
        "我支持你。",
        "这帖子迟早被喷。",
        "修仙界要变天了。",
        "哈哈哈哈。",
        "确实如此。",
        "建议删除。",
        "你号没了。"
    ];

    post.reply = names[Math.floor(Math.random() * names.length)] + "：" + texts[Math.floor(Math.random() * texts.length)];
}

// 发帖
function createPlayerPost() {
    let title = prompt("输入帖子标题");
    if (!title) return;

    let content = prompt("输入帖子内容");
    if (!content) return;

    forumPosts.unshift({
        title: "【玩家】" + title,
        author: player.name || "匿名玩家",
        sect: player.currentSect || "散修",
        likes: 0,
        content: content,
        reply: "暂无回复",
        channel: "玩家"
    });

    player.fame += 10;
    addEvent("📰 你发布了一篇帖子，声望+10");

    autoReply(forumPosts[0]);
    openForum();
}

// 点赞
function likePost(i) {
    forumPosts[i].likes += 1;
    addEvent("👍 帖子热度提升");
    openForum();
}

// 回复
function replyPost(i) {
    let txt = prompt("输入回复");
    if (!txt) return;

    forumPosts[i].reply = (player.name || "玩家") + "：" + txt;
    player.fame += 2;
    addEvent("💬 成功回复帖子，声望+2");

    openForum();
}

// 打开论坛（主入口）
function openForum() {
    randomForumPost();

    let hotHtml = getHotTopics().map((p, index) => `
        <div style="
            background:#fff5df;
            padding:6px;
            margin:4px 0;
            border-radius:18px;
            font-size:0.65rem;
        ">
            🔥 #${index + 1} ${p.title}
            （${p.likes}热度）
        </div>
    `).join("");

    let html = `
        <div class="modal" id="forumModal">
            <div class="modal-content">
                <h2>📰 修仙论坛</h2>
                <button class="choice-btn" onclick="createPlayerPost()">✍️ 发帖</button>
                <h3>🔥 修仙热搜榜</h3>
                ${hotHtml}
                ${forumPosts.map((p, i) => `
                    <div class="forum-post">
                        <div class="forum-title">【${p.channel}】${p.title}</div>
                        <div class="forum-meta">✍️ ${p.author} 【${p.sect}】 · 👍 ${p.likes}</div>
                        <div class="forum-content">${p.content}</div>
                        <div class="reply-item">${p.reply}</div>
                        <button class="choice-btn" onclick="likePost(${i})">👍 点赞</button>
                        <button class="choice-btn" onclick="replyPost(${i})">💬 回帖</button>
                    </div>
                `).join("")}
                <button class="choice-btn" onclick="document.getElementById('forumModal').remove()">关闭</button>
            </div>
        </div>
    `;

    // 如果已有模态框则移除后重新添加，避免重复
    let existingModal = document.getElementById("forumModal");
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML("beforeend", html);
}

// =========================
// 论坛按钮绑定
// =========================
if (document.getElementById("forumBtn")) {
    document.getElementById("forumBtn").onclick = openForum;
        }
