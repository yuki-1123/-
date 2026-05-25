// =========================
// Buff系统
// =========================
class BuffSystem {
    static addBuff(target, buff) {
        if (!target.buffs) target.buffs = [];
        let exist = target.buffs.find(b => b.type === buff.type);
        if (exist) {
            exist.duration = Math.max(exist.duration, buff.duration);
            if (exist.stack < exist.maxStack) exist.stack++;
            return;
        }
        target.buffs.push({ ...buff, stack: 1 });
        addBattleLog(`✨ ${target.name} 获得状态【${buff.name}】`);
    }

    static onTurnStart(target) {
        if (!target.buffs) return;
        for (let buff of target.buffs) {
            switch (buff.type) {
                case "burn":
                    target.hp -= buff.value * buff.stack;
                    addBattleLog(`🔥 ${target.name} 受到 ${buff.value * buff.stack} 灼烧伤害`);
                    break;
                case "poison":
                    target.hp -= buff.value * buff.stack;
                    addBattleLog(`☠️ ${target.name} 中毒损失 ${buff.value * buff.stack} 气血`);
                    break;
                case "regen":
                    let maxHp = baseHp[player.realmIdx];
                    let heal = Math.min(maxHp - target.hp, buff.value * buff.stack);
                    target.hp += heal;
                    addBattleLog(`💚 ${target.name} 回复 ${heal} 气血`);
                    break;
            }
        }
    }

    static onTurnEnd(target) {
        if (!target.buffs) return;
        target.buffs.forEach(buff => buff.duration--);
        target.buffs = target.buffs.filter(buff => buff.duration > 0);
    }

    static isFrozen(target) {
        if (!target.buffs) return false;
        return target.buffs.some(b => b.type === "freeze");
    }

    static isStunned(target) {
        if (!target.buffs) return false;
        return target.buffs.some(b => b.type === "stun");
    }

    static getDamageMultiplier(target) {
        if (!target.buffs) return 1;
        let multi = 1;
        target.buffs.forEach(buff => {
            if (buff.type === "rage") multi += buff.value;
            if (buff.type === "weak") multi -= buff.value;
        });
        return Math.max(0.5, multi);
    }

    static getReduceDamage(target) {
        if (!target.buffs) return 0;
        let reduce = 0;
        target.buffs.forEach(buff => {
            if (buff.type === "shield") reduce += buff.value;
        });
        return reduce;
    }
}

// =========================
// 战斗核心系统
// =========================
class CombatSystem {
    static startBattle(attacker, defender) {
        const logs = [];
        let round = 1;

        while (attacker.hp > 0 && defender.hp > 0) {
            // 回合开始Buff结算
            BuffSystem.onTurnStart(attacker);
            BuffSystem.onTurnStart(defender);
            
            if (attacker.hp <= 0 || defender.hp <= 0) break;

            let attackerCanMove = true;
            if (BuffSystem.isFrozen(attacker)) {
                logs.push(`❄️ ${attacker.name} 被冻结`);
                attackerCanMove = false;
            }
            if (BuffSystem.isStunned(attacker)) {
                logs.push(`⚡ ${attacker.name} 被眩晕`);
                attackerCanMove = false;
            }

            // 玩家攻击
            if (attackerCanMove) {
                const atkResult = this.calculateDamage(attacker, defender);
                defender.hp -= atkResult.damage;
                logs.push(`第${round}回合：${attacker.name} 对 ${defender.name} 造成 ${atkResult.damage} 伤害`);
                if (atkResult.crit) logs.push(`💥 触发暴击！`);
                if (atkResult.dodge) logs.push(`🌪️ ${defender.name} 闪避了攻击`);
            }

            if (defender.hp <= 0) {
                BuffSystem.onTurnEnd(attacker);
                BuffSystem.onTurnEnd(defender);
                break;
            }

            // 敌人攻击
            let defenderCanMove = true;
            if (BuffSystem.isFrozen(defender)) {
                logs.push(`❄️ ${defender.name} 被冻结`);
                defenderCanMove = false;
            }
            if (BuffSystem.isStunned(defender)) {
                logs.push(`⚡ ${defender.name} 被眩晕`);
                defenderCanMove = false;
            }

            if (defenderCanMove) {
                const defResult = this.calculateDamage(defender, attacker);
                attacker.hp -= defResult.damage;
                logs.push(`${defender.name} 对 ${attacker.name} 造成 ${defResult.damage} 伤害`);
                if (defResult.crit) logs.push(`💢 ${defender.name} 暴击！`);
                if (defResult.dodge) logs.push(`🌪️ 你闪避了攻击`);
            }

            // 回合结束Buff
            BuffSystem.onTurnEnd(attacker);
            BuffSystem.onTurnEnd(defender);
            round++;
            if (round >= 50) {
                logs.push("⌛ 战斗超时");
                break;
            }
        }

        attacker.hp = Math.max(1, attacker.hp);
        return { win: defender.hp <= 0, logs, playerHp: attacker.hp, enemyHp: Math.max(0, defender.hp) };
    }

    static calculateDamage(attacker, defender) {
        let dodgeRate = defender.dodge || 0;
        if (Math.random() < dodgeRate) return { damage: 0, crit: false, dodge: true };

        let attack = attacker.attack || calcPower();
        let random = 0.85 + Math.random() * 0.3;
        let crit = false;
        let critRate = attacker.critRate || getSkillCritRate();
        let critDamage = attacker.critDamage || 2;

        if (Math.random() < critRate) {
            crit = true;
            attack *= critDamage;
        }

        let skillBonus = getSkillDamageBonus();
        let buffBonus = BuffSystem.getDamageMultiplier(attacker);
        skillBonus *= buffBonus;

        let elementBonus = getElementAdvantage(attacker.elements || [], defender.elements || []);
        let bossBonus = defender.isBoss ? 1.2 : 1;

        let finalDamage = Math.floor(attack * random * skillBonus * elementBonus * bossBonus);
        let reduce = BuffSystem.getReduceDamage(defender);
        finalDamage *= (1 - reduce);
        finalDamage = Math.max(1, Math.floor(finalDamage));

        let lifeSteal = getLifeSteal();
        if (lifeSteal > 0) {
            let heal = Math.floor(finalDamage * lifeSteal);
            attacker.hp += heal;
        }

        return { damage: finalDamage, crit, dodge: false };
    }

    static giveReward(player, enemy) {
        player.stones += enemy.reward;
        player.cultivation = Math.min(getNeedExp(), player.cultivation + enemy.exp);
        addBattleLog(`🎁 获得 ${enemy.reward} 灵石，${enemy.exp} 修为`);
        if (enemy.drop) {
            player.inventory.push(enemy.drop);
            addBattleLog(`🎁 掉落 ${enemy.drop.name}`);
        }
    }
}

// =========================
// 战斗入口
// =========================
function battle(enemy) {
    const result = CombatSystem.startBattle(player, enemy);
    result.logs.forEach(log => addBattleLog(log));
    
    if (result.win) {
        player.totalKills++;
        addBattleLog(`🎉 击败 ${enemy.name}`);
        CombatSystem.giveReward(player, enemy);
        
        let combo = checkComboSkill();
        if (combo) addBattleLog(`✨✨✨ 发动组合技【${combo.name}】！✨✨✨`);
    } else {
        player.totalDeaths++;
        addBattleLog(`💀 被 ${enemy.name} 击败`, false);
        player.hp = Math.max(1, player.hp * 0.3);
    }
}