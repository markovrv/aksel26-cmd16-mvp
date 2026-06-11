// main.js — Главный файл игры "Выберем профессию" — полная интеграция (3 профессии)
import * as THREE from "three";
import { SceneManager } from "./core/SceneManager.js";
import { UIManager } from "./core/UIManager.js";
import { GameStateManager } from "./core/GameStateManager.js";
import { EntryScreen } from "./scenes/EntryScreen.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { ProfessionIntro } from "./scenes/ProfessionIntro.js";
import { ConstructionSite } from "./scenes/ConstructionSite.js";
import { DispatchRoom } from "./scenes/DispatchRoom.js";
import { InspectionSite } from "./scenes/InspectionSite.js";
import { ResultScreen } from "./scenes/ResultScreen.js";
import { ForemanTasks } from "./tasks/ForemanTasks.js";
import { EngineerTasks } from "./tasks/EngineerTasks.js";
import { InspectorTasks } from "./tasks/InspectorTasks.js";
import { PDFExporter } from "./utils/PDFExporter.js";

class Game {
	constructor() {
		this.canvas = document.getElementById("game-canvas");
		this.sm = new SceneManager(this.canvas);
		this.ui = new UIManager();
		this.gs = new GameStateManager();
		this.pdf = new PDFExporter();

		this.entryScreen = new EntryScreen(this.sm);
		this.mainMenu = new MainMenu(this.sm);
		this.professionIntro = new ProfessionIntro(this.sm);
		this.constructionSite = new ConstructionSite(this.sm);
		this.dispatchRoom = new DispatchRoom(this.sm);
		this.inspectionSite = new InspectionSite(this.sm);
		this.resultScreen = new ResultScreen(this.sm);

		this.foremanTasks = new ForemanTasks(this.ui, this.constructionSite, this.gs);
		this.engineerTasks = new EngineerTasks(this.ui, this.dispatchRoom, this.gs);
		this.inspectorTasks = new InspectorTasks(this.ui, this.inspectionSite, this.gs);

		this.init();
	}

	async init() {
		this.ui.showLoading("Загрузка игры...");
		await this.delay(300);
		this.setupEntryHandlers();
		this.setupKeyboardHandler();

		this.sm.switchScene("entry");
		this.entryScreen.show();
		this.ui.showEntryScreen();
		this.ui.hideLoading();
		this.sm.animate((delta) => this.update(delta));
	}

	delay(ms) { return new Promise(r => setTimeout(r, ms)); }

	setupEntryHandlers() {
		const nameInput = document.getElementById("player-name");
		const startBtn = document.getElementById("start-btn");
		if (nameInput) {
			nameInput.addEventListener("input", () => {
				startBtn.disabled = nameInput.value.trim().length < 2;
				this.gs.playerName = nameInput.value.trim();
			});
		}
		document.querySelectorAll(".avatar-option").forEach(el => {
			el.addEventListener("click", () => {
				document.querySelectorAll(".avatar-option").forEach(a => a.classList.remove("selected"));
				el.classList.add("selected");
				this.gs.avatar = el.dataset.avatar;
			});
		});
		if (startBtn) startBtn.addEventListener("click", () => this.startGame());
	}

	setupKeyboardHandler() {
		document.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				const btn = document.getElementById("start-btn");
				if (!btn?.disabled && !document.getElementById("entry-screen")?.classList.contains("hidden")) {
					this.startGame();
				}
			}
		});
	}

	async startGame() {
		this.gs.playerName = document.getElementById("player-name")?.value.trim() || "Игрок";
		if (this.gs.playerName.length < 2) return;
		await this.ui.fadeOut(0.4);
		this.ui.hideEntryScreen();
		this.entryScreen.hide();
		await this.delay(300);
		this.sm.switchScene("menu");
		this.mainMenu.show();
		this.checkInspectorUnlock();
		this.ui.fadeIn(0.4);
		this.ui.showInstruction(
			`🏗️ Привет, ${this.gs.playerName}!`,
			"Перед вами три стенда с профессиями.\n\n👷 <b>Прораб</b> — управляет строительной площадкой\n⚡ <b>Инженер-энергетик</b> — диспетчер энергосистемы\n🔬 <b>Инженер КК</b> — контроль качества (открывается после двух других)",
			"Выбрать профессию", null,
		);
	}

	selectProfession(profession) {
		if (profession === "locked") {
			if (this.gs.allCompleted) {
				this.ui.showToast("🔄 Перезайдите в меню, чтобы открыть Инженера КК", "info");
			} else {
				this.ui.showToast("🔒 Пройдите Прораба и Инженера-энергетика, чтобы открыть!", "info", 4000);
			}
			return;
		}
		this.ui.hideInstruction();

		const flyTargets = {
			foreman: { pos: { x: -4, y: 3, z: 5 }, look: { x: -4, y: 1, z: 0 } },
			engineer: { pos: { x: 4, y: 3, z: 5 }, look: { x: 4, y: 1, z: 0 } },
			inspector: { pos: { x: 0, y: 3, z: 5 }, look: { x: 0, y: 1, z: -3 } },
		};
		const t = flyTargets[profession] || flyTargets.foreman;

		this.sm.flyCameraTo(this.sm.menuCamera, t.pos, t.look, 1.2).then(async () => {
			await this.ui.fadeOut(0.5);
			this.mainMenu.hide();
			this.gs.startProfession(profession);
			this.sm.switchScene("intro");
			this.showProfessionIntro(profession);
		});
	}

	async showProfessionIntro(profession) {
		this.professionIntro.show(profession);
		this.ui.showIntroScreen();

		const profData = {
			foreman: {
				title: "👷 Профессия: Мастер СМР (Прораб)",
				duties: "✓ Принимает материалы на объекте\n✓ Ставит задачи бригадам\n✓ Решает нештатные ситуации\n✓ Отвечает за безопасность и сроки",
				btn: "🏗️ Начать работу",
			},
			engineer: {
				title: "⚡ Профессия: Инженер-энергетик",
				duties: "✓ Контролирует нагрузку подстанций\n✓ Распределяет резервные мощности\n✓ Устраняет аварии на ЛЭП\n✓ Обеспечивает бесперебойное энергоснабжение",
				btn: "⚡ Приступить",
			},
			inspector: {
				title: "🔬 Профессия: Инженер КК (Технадзор)",
				duties: "✓ Проверяет кладку и швы на соответствие нормам\n✓ Измеряет геометрию конструкций\n✓ Ведёт журнал дефектов и выдаёт предписания\n✓ Решает: допустить объект или остановить работы",
				btn: "🔬 Начать осмотр",
			},
		};

		const data = profData[profession] || profData.foreman;
		const titleEl = document.getElementById("intro-profession-title");
		const dutiesEl = document.getElementById("intro-duties");
		if (titleEl) titleEl.textContent = data.title;
		if (dutiesEl) dutiesEl.innerHTML = data.duties.replace(/\n/g, "<br>");

		await this.ui.fadeIn(0.5);

		const backBtn = document.getElementById("intro-back");
		if (backBtn) {
			const nb = backBtn.cloneNode(true);
			backBtn.parentNode.replaceChild(nb, backBtn);
			nb.addEventListener("click", async () => {
				await this.ui.fadeOut(0.3);
				this.professionIntro.hide();
				this.ui.hideIntroScreen();
				this.gs.currentProfession = null;
				this.sm.switchScene("menu");
				this.sm.menuCamera.position.set(0, 8, 14);
				this.sm.menuCamera.lookAt(0, 0, 0);
				this.mainMenu.show();
				this.checkInspectorUnlock();
				this.ui.fadeIn(0.3);
			});
		}

		const startBtn = document.getElementById("intro-start");
		if (startBtn) {
			const ns = startBtn.cloneNode(true);
			startBtn.parentNode.replaceChild(ns, startBtn);
			ns.textContent = data.btn;
			ns.addEventListener("click", () => this.startGameplay(profession));
		}
	}

	async startGameplay(profession) {
		await this.ui.fadeOut(0.4);
		this.professionIntro.hide();
		this.ui.hideIntroScreen();
		this.ui.hideInstruction();
		this.ui.resetAll();

		const profNames = {
			foreman: "Прораб",
			engineer: "Инженер-энергетик",
			inspector: "Инженер КК",
		};

		const briefings = {
			foreman: "Вы — прораб на строительной площадке!\n\n📋 Задача 1: Принять доставку материалов\n👷 Задача 2: Распределить рабочих по зонам\n⚠️ Задача 3: Аварийная ситуация",
			engineer: "Вы — диспетчер энергосистемы!\n\n⚡ Задача 1: Устранить перегрузку\n📊 Задача 2: Распределить резерв\n🚨 Задача 3: Авария на ЛЭП",
			inspector: "Вы — инженер по контролю качества!\n\n🔍 Задача 1: Осмотр стены и поиск дефектов\n📋 Задача 2: Проверка документации\n📞 Задача 3: Приёмка под давлением",
		};

		const sceneSetup = {
			foreman: () => {
				this.sm.switchScene("foreman");
				this.constructionSite.show();
				this.sm.foremanCamera.position.set(10, 8, 10);
				this.sm.foremanCamera.lookAt(0, 1, 0);
				this.sm.controls.enabled = true;
			},
			engineer: () => {
				this.sm.switchScene("engineer");
				this.dispatchRoom.show();
				this.sm.engineerCamera.position.set(0, 1.8, 5);
				this.sm.engineerCamera.lookAt(0, 1.5, -5);
				this.sm.controls.enabled = false;
			},
			inspector: () => {
				this.sm.switchScene("inspector");
				this.inspectionSite.show();
				this.sm.inspectorCamera.position.set(0, 1.7, 3);
				this.sm.inspectorCamera.lookAt(0, 1.7, -4);
				this.sm.controls.enabled = true;
			},
		};

		sceneSetup[profession]?.();
		this.ui.showHUD();
		this.gs.currentTask = 0;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({
			player: this.gs.playerName,
			profession: profNames[profession] || profession,
			score: 0, task: 1,
		});

		this.ui.setTaskProgress(1, "active");
		this.ui.setTaskProgress(2, "");
		this.ui.setTaskProgress(3, "");
		await this.ui.fadeIn(0.4);

		this.ui.showInstruction(
			profNames[profession] || profession,
			briefings[profession] || "",
			profession === "foreman" ? "🏗️ Начать работу" : profession === "inspector" ? "🔍 Приступить" : "⚡ Приступить",
			() => {
				this.ui.startTimer();
				this.runTasks(profession);
			},
		);
	}

	async runTasks(profession) {
		try {
			if (profession === "foreman") await this.runForemanTasks();
			else if (profession === "engineer") await this.runEngineerTasks();
			else await this.runInspectorTasks();

			this.gs.checkAchievements();
			await this.showResults();
		} catch (err) {
			console.error("Task error:", err);
		}
	}

	async runForemanTasks() {
		const ft = this.foremanTasks;
		this.gs.currentTask = 0;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 1, score: this.gs.totalScore });
		const r1 = await ft.startTask1();
		this.gs.completeTask(1, r1.score, r1.accepted ? 1 : 0);
		await this.delay(1500);

		this.gs.currentTask = 1;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 2, score: this.gs.totalScore });
		this.ui.setTaskProgress(1, "completed");
		const r2 = await ft.startTask2();
		this.gs.completeTask(2, r2.score, r2.errors === 0 ? 1 : 0);
		await this.delay(2000);

		this.gs.currentTask = 2;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 3, score: this.gs.totalScore });
		this.ui.setTaskProgress(2, "completed");
		const r3 = await ft.startTask3();
		this.gs.completeTask(3, Math.max(0, r3.score), r3.choice);
		this.ui.setTaskProgress(3, r3.score >= 20 ? "completed" : "error");
	}

	async runEngineerTasks() {
		const et = this.engineerTasks;
		this.gs.currentTask = 0;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 1, score: this.gs.totalScore });
		const r1 = await et.startTask1();
		this.gs.completeTask(1, r1.score, r1.choice);
		await this.delay(1500);

		this.gs.currentTask = 1;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 2, score: this.gs.totalScore });
		this.ui.setTaskProgress(1, "completed");
		const r2 = await et.startTask2();
		this.gs.completeTask(2, r2.score, r2.errors === 0 ? 1 : 0);
		await this.delay(2000);

		this.gs.currentTask = 2;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 3, score: this.gs.totalScore });
		this.ui.setTaskProgress(2, "completed");
		const r3 = await et.startTask3();
		this.gs.completeTask(3, r3.score, r3.choice);
		this.ui.setTaskProgress(3, r3.score >= 20 ? "completed" : "error");
	}

	async runInspectorTasks() {
		const it = this.inspectorTasks;

		// Task 1 — Осмотр стены
		this.gs.currentTask = 0;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 1, score: this.gs.totalScore });

		const r1 = await it.startTask1();
		this.gs.completeTask(1, r1.score, r1.choice);

		await this.delay(1500);

		// Task 2 — Проверка документации
		this.gs.currentTask = 1;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 2, score: this.gs.totalScore });
		this.ui.setTaskProgress(1, "completed");

		const r2 = await it.startTask2();
		this.gs.completeTask(2, r2.score, r2.choice);

		await this.delay(2000);

		// Task 3 — Звонок заказчика
		this.gs.currentTask = 2;
		this.gs.taskStartTime = Date.now();
		this.ui.updateHUD({ task: 3, score: this.gs.totalScore });
		this.ui.setTaskProgress(2, "completed");

		const r3 = await it.startTask3();
		this.gs.completeTask(3, r3.score, r3.choice);
		this.ui.setTaskProgress(3, r3.score >= 20 ? "completed" : "error");
	}

	async showResults() {
		this.ui.stopTimer();
		this.ui.hideHUD();
		this.constructionSite.hide();
		this.dispatchRoom.hide();
		this.inspectionSite.hide();

		// Save to history
		this.gs.saveToHistory(this.gs.currentProfession);

		await this.ui.fadeOut(0.6);
		this.sm.switchScene("results");
		this.resultScreen.show();
		await this.ui.fadeIn(0.6);

		const totalTime = this.gs.getTotalTimeFormatted();
		this.ui.showResults(
			this.gs.totalScore, totalTime, this.gs.getAchievementDetails(),
			() => this.exportPDF(), () => this.retryProfession(), () => this.switchProfession(),
		);

		// All professions achievement
		if (this.gs.allCompleted && !this.gs.achievements.includes("master_builder")) {
			this.gs.achievements.push("master_builder");
			this.ui.showToast("🏆 ДОСТИЖЕНИЕ: Мастер строительной отрасли!", "success", 5000);
		}
	}

	async exportPDF() {
		try {
			await this.pdf.generate(this.gs, this.gs.currentProfession);
			this.ui.showToast("✅ PDF сохранён!", "success");
		} catch (err) {
			console.error("PDF error:", err);
			this.ui.showToast("❌ Ошибка при сохранении PDF", "error");
		}
	}

	async retryProfession() {
		this.ui.hideResultsScreen();
		this.resultScreen.hide();
		this.ui.resetAll();
		const prof = this.gs.currentProfession;
		this.gs.startProfession(prof);
		this.startGameplay(prof);
	}

	async switchProfession() {
		this.ui.hideResultsScreen();
		this.resultScreen.hide();
		this.ui.resetAll();
		await this.ui.fadeOut(0.4);
		this.gs.reset();
		this.sm.switchScene("menu");
		this.sm.menuCamera.position.set(0, 8, 14);
		this.sm.menuCamera.lookAt(0, 0, 0);
		this.mainMenu.show();
		this.checkInspectorUnlock();
		await this.ui.fadeIn(0.4);
		this.ui.showInstruction(
			"🏗️ Выберите другую профессию",
			"Попробуйте свои силы в новой роли!",
			"Выбрать", null,
		);
	}

	checkInspectorUnlock() {
		if (this.gs.allCompleted) {
			const unlocked = this.mainMenu.unlockInspector();
			if (unlocked) {
				this.ui.showToast("🔬 Новая профессия открыта: Инженер КК!", "success", 4000);
			}
		}
	}

	handleClick(event) {
		const rect = this.canvas.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		const raycaster = this.sm.raycaster;
		raycaster.setFromCamera(mouse, this.sm.activeCamera);

		if (this.sm.currentSceneName === "menu") {
			const result = this.mainMenu.onClick(mouse);
			if (result) this.selectProfession(result);
			return;
		}

		// Inspector click — wall zone inspection
		if (this.sm.currentSceneName === "inspector") {
			if (this.gs.currentTask === 0) {
				const hit = raycaster.intersectObjects(this.inspectionSite.clickableObjects, true);
				if (hit.length > 0) {
					const obj = hit[0].object;
					if (obj.userData && obj.userData.zoneRow !== undefined) {
						const zi = obj.userData.zoneRow * 3 + obj.userData.zoneCol;
						this.inspectorTasks.onWallZoneClick(zi);
					}
				}
			}
			return;
		}

		// Foreman click
		if (this.sm.currentSceneName === "foreman") {
			if (this.gs.currentTask !== 0) return;
			const hit = raycaster.intersectObjects(this.constructionSite.clickableObjects, true);
			if (hit.length > 0) this.foremanTasks.showTask1Modal();
			return;
		}

		// Engineer click
		if (this.sm.currentSceneName === "engineer") {
			if (this.gs.currentTask !== 0) return;
			const hit = raycaster.intersectObjects(this.dispatchRoom.clickableObjects, true);
			if (hit.length > 0) {
				const clicked = hit[0].object;
				const subs = this.dispatchRoom.objects.substations;
				if (subs && subs[1] && subs[1].mesh === clicked) this.engineerTasks.showTask1Modal();
			}
			return;
		}
	}

	handleMouseMove(event) {
		this.sm.updateParallax(event.clientX, event.clientY);
		if (this.sm.currentSceneName === "menu") {
			const rect = this.canvas.getBoundingClientRect();
			const mouse = new THREE.Vector2(
				((event.clientX - rect.left) / rect.width) * 2 - 1,
				-((event.clientY - rect.top) / rect.height) * 2 + 1,
			);
			this.mainMenu.onMouseMove(mouse);
		}
	}

	update(delta) {
		this.entryScreen.update(performance.now() / 1000);
		this.mainMenu.update(delta);
		this.constructionSite.update(delta);
		this.dispatchRoom.update(delta);
		this.inspectionSite.update(delta);
		this.resultScreen.update(delta);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const game = new Game();
	window.game = game;
	game.canvas.addEventListener("click", (e) => game.handleClick(e));
	game.canvas.addEventListener("mousemove", (e) => game.handleMouseMove(e));
});

export default Game;
