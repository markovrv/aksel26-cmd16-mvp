// ForemanTasks.js — 3 задачи для профессии Прораб (по спецификации)
import * as THREE from "three";

export class ForemanTasks {
	constructor(uiManager, constructionScene, gameState) {
		this.ui = uiManager;
		this.scene = constructionScene;
		this.gs = gameState;

		this.canCheckAgain = true;
		this.resolveTask1 = null;
		this.resolveTask2 = null;
		this.resolveTask3 = null;
	}

	// ── Задача 1: Приёмка материалов ──
	async startTask1() {
		this.canCheckAgain = true;
		this.ui.setTaskProgress(1, "active");
		this.ui.showHint("💡 Нажмите на грузовик 🚚 или блок СКЛАД для приёмки материалов", 8000);
		this.ui.showClickHint("Кликни на грузовик 🚚");

		// Animate truck arrival
		this.scene.animateTruckArrival();

		return new Promise(resolve => { this.resolveTask1 = resolve; });
	}

	showTask1Modal() {
		const extraInfo = !this.canCheckAgain
			? '<p style="margin-top:10px;color:#22c55e;font-size:0.9rem;">✅ Вы уже проверили документы. Поставщик: ООО "КирпичСтрой", Сертификат качества №4412</p>'
			: "";

		const bodyHTML = `
			<div class="document-view">
				<div class="document-header">
					<h4>ТОВАРНАЯ НАКЛАДНАЯ №1234</h4>
					<p>от ${new Date().toLocaleDateString("ru-RU")}</p>
				</div>
				<table class="document-table">
					<tr><th>Материал</th><th>Заказано</th><th>Доставлено</th></tr>
					<tr><td>Кирпич керамический</td><td>500 шт</td><td>520 шт <span style="color:#22c55e;">✓</span></td></tr>
					<tr><td>Качество</td><td colspan="2"><span class="document-status ok">НОРМА</span></td></tr>
					<tr><td>Документы</td><td colspan="2"><span class="document-status ok">В ПОРЯДКЕ</span></td></tr>
				</table>
				<p style="margin-top:15px;color:#94a3b8;">
					💡 <strong>Совет:</strong> Излишек 20 шт — допустимо. Качество и документы в порядке.
				</p>
				${extraInfo}
			</div>
		`;

		const footerHTML = `
			<button class="btn btn-success" id="t1-accept">✅ ПРИНЯТЬ</button>
			<button class="btn btn-danger" id="t1-reject">❌ ОТКАЗАТЬ</button>
			${this.canCheckAgain ? '<button class="btn btn-secondary" id="t1-check">🔍 ПРОВЕРИТЬ ЕЩЁ РАЗ</button>' : ""}
		`;

		this.ui.showModal("🚛 Приёмка материалов", bodyHTML, footerHTML);

		// Wait a tick for DOM
		setTimeout(() => {
			const acceptBtn = document.getElementById("t1-accept");
			const rejectBtn = document.getElementById("t1-reject");
			const checkBtn = document.getElementById("t1-check");

			if (acceptBtn) acceptBtn.addEventListener("click", () => { this.ui.hideModal(); this.completeTask1(true); });
			if (rejectBtn) rejectBtn.addEventListener("click", () => { this.ui.hideModal(); this.completeTask1(false); });
			if (checkBtn) checkBtn.addEventListener("click", () => {
				this.canCheckAgain = false;
				this.ui.showToast("🔍 Проверка: документы в порядке, поставщик надёжный", "info");
				// Re-open modal with extra info
				this.ui.hideModal();
				setTimeout(() => this.showTask1Modal(), 300);
			});
		}, 50);
	}

	completeTask1(accepted) {
		let score = 0;
		if (accepted) {
			score = 10;
			this.ui.animateScore(this.gs.totalScore + 10);
			this.scene.animateTruckDeparture();
			this.ui.setTaskProgress(1, "completed");
			this.ui.showToast("✅ +10 очков! Правильное решение", "success");
		} else {
			this.ui.showToast("❌ Неправильно! Количество в норме — можно было принять", "error");
			this.ui.setTaskProgress(1, "error");
		}

		if (this.resolveTask1) {
			this.resolveTask1({ score, accepted });
			this.resolveTask1 = null;
		}
	}

	// ── Задача 2: Распределение бригад ──
	async startTask2() {
		this.ui.setTaskProgress(2, "active");
		this.ui.showHint("💡 Перетащите рабочих в нужные зоны, потом нажмите ГОТОВО", 8000);
		this.ui.showClickHint("Нажмите ГОТОВО когда распределите всех");

		const workers = [
			{ name: "Пётр", role: "каменщик", color: "#3366cc" },
			{ name: "Василий", role: "подсобник", color: "#33aa55" },
			{ name: "Николай", role: "каменщик", color: "#3366cc" },
			{ name: "Ольга", role: "сварщик", color: "#8844aa" },
			{ name: "Евгений", role: "водитель", color: "#cc6633" },
		];

		this.ui.showTaskPanel(workers, () => this.completeTask2(), () => this.cancelTask2());

		return new Promise(resolve => { this.resolveTask2 = resolve; });
	}

	completeTask2() {
		const assignments = this.ui.getWorkerAssignments();

		// Правильно: Фундамент — Пётр(0) + Василий(1); Стены — Николай(2) + Ольга(3) + Евгений(4)
		const correctF = [0, 1];
		const correctW = [2, 3, 4];

		const fOk = assignments.foundation.length === 2 && correctF.every(id => assignments.foundation.includes(id));
		const wOk = assignments.walls.length === 3 && correctW.every(id => assignments.walls.includes(id));

		let errors = 0;
		if (assignments.foundation.length !== 2 || !fOk) errors++;
		if (assignments.walls.length !== 3 || !wOk) errors++;

		let score = 0, message = "";
		if (errors === 0) {
			score = 15;
			message = "✅ +15 баллов! Отличное распределение!";
			this.ui.setTaskProgress(2, "completed");
		} else if (errors === 1) {
			score = 7;
			message = "⚠️ Почти! +7 баллов. Евгений-водитель может помогать на стенах";
			this.ui.setTaskProgress(2, "completed");
		} else {
			score = 0;
			message = "❌ Правильное решение: Фундамент — Пётр и Василий, Стены — Николай, Ольга и Евгений";
			this.ui.setTaskProgress(2, "error");
		}

		this.ui.showToast(message, errors === 0 ? "success" : "warning");

		// 3D animation
		this.scene.moveWorkersToZones(assignments);

		if (this.resolveTask2) {
			this.resolveTask2({ score, errors });
			this.resolveTask2 = null;
		}
	}

	cancelTask2() {
		this.ui.hideTaskPanel();
		this.scene.animateWorkersScatter();
		this.ui.showToast("❌ Работники ушли, вы не дали им задание", "error", 4000);
		this.ui.setTaskProgress(2, "error");

		if (this.resolveTask2) {
			this.resolveTask2({ score: 0, errors: 99 });
			this.resolveTask2 = null;
		}
	}

	// ── Задача 3: Аварийная ситуация ──
	async startTask3() {
		this.ui.showAlert();
		this.ui.setTaskProgress(3, "active");
		this.scene.startEmergency();

		return new Promise(resolve => {
			setTimeout(() => {
				this.resolveTask3 = resolve;
				this.showTask3Modal();
			}, 2000);
		});
	}

	showTask3Modal() {
		this.ui.showInstruction(
			"⚠️ ЗАДАЧА 3: ЧРЕЗВЫЧАЙНАЯ СИТУАЦИЯ",
			"Монтажники докладывают: закончились анкерные болты!\nБез них нельзя крепить плиты. Стройка встаёт.\n\nЧто делать?",
			"Принять решение",
			() => this.showTask3Choices(),
		);
	}

	showTask3Choices() {
		const bodyHTML = `
			<div style="background:#2a1a1a;padding:20px;border-radius:12px;margin-bottom:20px;">
				<h4 style="color:#EF4444;margin-bottom:10px;">🚨 ЧРЕЗВЫЧАЙНАЯ СИТУАЦИЯ</h4>
				<p>Закончились анкерные болты для крепления плит. Что делать?</p>
			</div>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="t3-choice" id="t3c1" value="1">
					<label for="t3c1"><strong>Отправить Василия на склад за болтами</strong><br><small style="color:#94A3B8;">~30 минут. Правильное решение.</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="t3-choice" id="t3c2" value="2">
					<label for="t3c2"><strong>Взять болты с соседнего объекта</strong><br><small style="color:#94A3B8;">Быстро, но нечестно.</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="t3-choice" id="t3c3" value="3">
					<label for="t3c3"><strong>Остановить работу до завтра</strong><br><small style="color:#94A3B8;">Потеря времени. −5 очков.</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="t3-confirm">✅ ПРИНЯТЬ РЕШЕНИЕ</button>`;

		this.ui.showModal("⚠️ Аварийная ситуация", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("t3-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="t3-choice"]:checked');
				if (selected) {
					this.ui.hideModal();
					this.completeTask3(parseInt(selected.value));
				} else {
					this.ui.showToast("Выберите один из вариантов", "warning");
				}
			});
		}, 50);
	}

	completeTask3(choice) {
		let score = 0, message = "";
		this.ui.hideAlert();
		this.scene.stopEmergency();

		switch (choice) {
			case 1: // ПРАВИЛЬНО
				score = 20;
				message = "✅ +20 баллов! Правильное и честное решение";
				this.ui.setTaskProgress(3, "completed");
				this.scene.animateVasiliyToWarehouse();
				break;
			case 2: // Нечестно
				score = 5;
				message = "⚠️ +5 баллов. Решение быстрое, но неэтичное. Достижение заменено";
				this.ui.setTaskProgress(3, "error");
				break;
			case 3: // Пассивно
				score = 0;
				message = "❌ Простой на стройке — это потери. Нужно действовать!";
				this.ui.setTaskProgress(3, "error");
				break;
		}

		this.ui.showToast(message, choice === 1 ? "success" : "warning");

		if (this.resolveTask3) {
			this.resolveTask3({ score, choice });
			this.resolveTask3 = null;
		}
	}
}

export default ForemanTasks;
