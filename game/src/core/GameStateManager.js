// GameStateManager.js — Управление состоянием игры (класс)
export class GameStateManager {
	constructor() {
		this.history = [];
		this.allCompleted = false;
		this.reset();
	}

	reset() {
		this.playerName = "";
		this.avatar = "👷";
		this.currentProfession = null;
		this.currentTask = 0;
		this.currentScene = "entry";

		this.scores = { task1: 0, task2: 0, task3: 0, bonus: 0 };
		this.totalScore = 0;

		this.taskStartTime = 0;
		this.totalStartTime = 0;
		this.taskTimes = [];
		this.taskTimestamps = [];

		this.choices = [];

		this.canCheckAgain = true;
		this.taskCompleted = { 1: false, 2: false, 3: false };

		this.achievements = [];
		// history is NOT reset
		this.updateAllCompleted();
	}

	saveToHistory(profession) {
		if (!this.history.some(h => h.profession === profession)) {
			this.history.push({ profession, timestamp: Date.now() });
		}
		this.updateAllCompleted();
	}

	updateAllCompleted() {
		this.allCompleted = ['foreman', 'engineer'].every(
			id => this.history.some(h => h.profession === id)
		);
	}

	// Start profession
	startProfession(profession) {
		this.currentProfession = profession;
		this.currentTask = 0;
		this.currentScene = profession;
		this.totalStartTime = Date.now();
		this.taskStartTime = Date.now();
		this.scores = { task1: 0, task2: 0, task3: 0, bonus: 0 };
		this.choices = [];
		this.taskCompleted = { 1: false, 2: false, 3: false };
		this.achievements = [];
		this.canCheckAgain = true;
		this.taskTimes = [];
		this.taskTimestamps = [];
	}

	// Complete task
	completeTask(taskNum, score, choice = null) {
		const taskKey = `task${taskNum}`;
		this.scores[taskKey] = score;
		this.taskCompleted[taskNum] = true;

		const taskTime = Date.now() - this.taskStartTime;
		this.taskTimes.push(taskTime);

		if (choice !== null) {
			this.choices.push({ task: taskNum, choice, score, time: taskTime });
		}

		this.checkBonusTime(taskNum, taskTime);
		this.calculateTotal();

		return { score, time: taskTime };
	}

	// Calculate total
	calculateTotal() {
		this.totalScore = this.scores.task1 + this.scores.task2 + this.scores.task3 + this.scores.bonus;
	}

	// Bonus time check
	checkBonusTime(taskNum, timeMs) {
		const thresholds = {
			1: { ms: 20000, bonus: 3 },
			2: { ms: 45000, bonus: 5 },
			3: { ms: 15000, bonus: 2 },
		};
		const t = thresholds[taskNum];
		if (t && timeMs < t.ms) {
			this.scores.bonus += t.bonus;
		}
	}

	// Achievement definitions
	static ACHIEVEMENTS = [
		{ id: "quick_solver",    name: "Быстрый решатель",   icon: "⚡", desc: "Задача выполнена за <30 сек" },
		{ id: "perfectionist",   name: "Перфекционист",      icon: "💎", desc: "Все задачи верны с первой попытки" },
		{ id: "found_solution",  name: "Нашёл решение",      icon: "🔧", desc: "Выбран правильный вариант в задаче 3 (Прораб)" },
		{ id: "responsible",     name: "Ответственный диспетчер", icon: "📊", desc: "Правильно расставлены приоритеты (Энергетик)" },
		{ id: "ethical",         name: "Этичный работник",   icon: "🤝", desc: "Не выбраны нечестные варианты" },
	];

	checkAchievements() {
		const { taskTimes, choices, scores } = this;

		if (taskTimes.some(t => t < 30000)) this.unlock("quick_solver");

		if (scores.task1 > 0 && scores.task2 > 0 && scores.task3 > 0) {
			if (choices.length === 3 && choices.every(c => c.score > 0)) {
				this.unlock("perfectionist");
			}
		}

		if (this.currentProfession === "foreman") {
			const t3 = choices.find(c => c.task === 3);
			if (t3 && t3.choice === 1) this.unlock("found_solution");
		}

		if (this.currentProfession === "engineer") {
			const t2 = choices.find(c => c.task === 2);
			if (t2 && t2.score >= 15) this.unlock("responsible");
		}

		const bad = choices.filter(c => c.choice === 2);
		if (bad.length === 0 && choices.length > 0) this.unlock("ethical");
	}

	unlock(id) {
		if (!this.achievements.includes(id)) this.achievements.push(id);
	}

	getAchievementDetails() {
		return this.achievements.map(id => {
			const def = GameStateManager.ACHIEVEMENTS.find(a => a.id === id);
			return def || { id, name: id, icon: "❓", desc: "" };
		});
	}

	getTotalTimeFormatted() {
		const elapsed = Date.now() - this.totalStartTime;
		const m = Math.floor(elapsed / 60000);
		const s = Math.floor((elapsed % 60000) / 1000);
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}

	getTotalTimeSeconds() {
		return Math.floor((Date.now() - this.totalStartTime) / 1000);
	}
}

export default GameStateManager;
