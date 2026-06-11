// EngineerTasks.js — 3 задачи для профессии Инженер-энергетик (по спецификации)
export class EngineerTasks {
	constructor(uiManager, dispatchScene, gameState) {
		this.ui = uiManager;
		this.scene = dispatchScene;
		this.gs = gameState;

		this.selectedPower = [];
		this.currentPower = 0;
		this.resolveTask1 = null;
		this.resolveTask2 = null;
		this.resolveTask3 = null;
	}

	// ── Задача 1: Снижение перегрузки ПС №2 ──
	async startTask1() {
		this.ui.setTaskProgress(1, "active");
		this.ui.showHint("💡 Кликните на оранжевый мигающий индикатор ПС №2", 8000);
		this.ui.showClickHint("Нажми на 🔴 ПС №2 на щитке");

		this.scene.startOverloadBlink();

		return new Promise(resolve => { this.resolveTask1 = resolve; });
	}

	showTask1Modal() {
		const bodyHTML = `
			<div style="background:#1a1a2a;padding:20px;border-radius:12px;margin-bottom:20px;">
				<h4 style="color:#F59E0B;margin-bottom:10px;">⚠️ ПЕРЕГРУЗКА ПС №2</h4>
				<p>Подстанция №2 перегружена на 78%! Нужно срочно перераспределить нагрузку.</p>
				<p style="margin-top:10px;"><strong>Текущая нагрузка:</strong> ПС №1: 45%, ПС №2: 78%, ПС №3: 23%</p>
			</div>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="e1-choice" id="e1c1" value="1">
					<label for="e1c1"><strong>Отключить 30% потребителей</strong><br><small style="color:#94A3B8;">Критично — без света останутся дома и больницы.</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="e1-choice" id="e1c2" value="2">
					<label for="e1c2"><strong>Переключить 15% нагрузки на ПС №3</strong><br><small style="color:#22C55E;">Оптимально! ПС №3 имеет резерв.</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="e1-choice" id="e1c3" value="3">
					<label for="e1c3"><strong>Увеличить генерацию на ПС №2</strong><br><small style="color:#94A3B8;">Опасно! Может привести к перегреву.</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="e1-confirm">✅ ПОДТВЕРДИТЬ</button>`;

		this.ui.showModal("Перегрузка подстанции", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("e1-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="e1-choice"]:checked');
				if (selected) {
					this.ui.hideModal();
					this.completeTask1(parseInt(selected.value));
				} else {
					this.ui.showToast("Выберите решение", "warning");
				}
			});
		}, 50);
	}

	completeTask1(choice) {
		let score = 0, message = "";

		switch (choice) {
			case 1:
				score = 0;
				message = "❌ Отключение потребителей — крайняя мера";
				this.ui.setTaskProgress(1, "error");
				break;
			case 2:
				score = 10;
				message = "✅ +10 баллов! Правильное распределение нагрузки";
				this.ui.setTaskProgress(1, "completed");
				this.scene.stopOverloadBlink();
				this.scene.updateSubstationLoad(1, 63, 0x22c55e); // PS2 → green
				this.scene.updateSubstationLoad(2, 38, 0xf59e0b); // PS3 → yellow
				break;
			case 3:
				score = 0;
				message = "❌ Увеличение генерации может вызвать аварию!";
				this.ui.setTaskProgress(1, "error");
				break;
		}

		this.ui.showToast(message, choice === 2 ? "success" : "warning");

		if (this.resolveTask1) {
			this.resolveTask1({ score, choice });
			this.resolveTask1 = null;
		}
	}

	// ── Задача 2: Распределение резерва 50 МВт ──
	async startTask2() {
		this.selectedPower = [];
		this.currentPower = 0;
		this.ui.setTaskProgress(2, "active");
		this.ui.showHint("💡 Выберите кому дать электричество. Приоритет — жизнь людей!", 8000);

		return new Promise(resolve => {
			this.resolveTask2 = resolve;
			this.showTask2Modal();
		});
	}

	showTask2Modal() {
		const bodyHTML = `
			<div class="power-counter">
				Выбрано: <span id="power-count">0</span> / 50 МВт
			</div>
			<div class="checkbox-options">
				<div class="checkbox-option" data-power="30" data-id="factory">
					<input type="checkbox" id="opt-factory">
					<div class="checkbox-content">
						<div class="checkbox-label">🏭 Завод (30 МВт)</div>
						<div class="checkbox-desc">Промышленное предприятие. Может подождать.</div>
					</div>
				</div>
				<div class="checkbox-option" data-power="10" data-id="hospital">
					<input type="checkbox" id="opt-hospital">
					<div class="checkbox-content">
						<div class="checkbox-label">🏥 Больница (10 МВт)</div>
						<div class="checkbox-desc">Критически важно! Операционная, реанимация.</div>
					</div>
				</div>
				<div class="checkbox-option" data-power="15" data-id="residential">
					<input type="checkbox" id="opt-residential">
					<div class="checkbox-content">
						<div class="checkbox-label">🏠 Жилой район (15 МВт)</div>
						<div class="checkbox-desc">13 000 жителей, школа, детский сад.</div>
					</div>
				</div>
			</div>
			<p style="margin-top:15px;color:#94A3B8;font-size:0.9rem;">
				💡 Не обязательно использовать все 50 МВт. Приоритет — объекты с людьми.
			</p>
		`;

		const footerHTML = `<button class="btn btn-primary" id="e2-confirm">✅ РАСПРЕДЕЛИТЬ</button>`;

		this.ui.showModal("Распределение резерва 50 МВт", bodyHTML, footerHTML);

		setTimeout(() => {
			// Checkbox handlers
			document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(cb => {
				cb.addEventListener("change", (e) => {
					const option = e.target.closest(".checkbox-option");
					const power = parseInt(option.dataset.power);
					if (e.target.checked) {
						if (this.currentPower + power <= 50) {
							this.selectedPower.push(option.dataset.id);
							this.currentPower += power;
						} else {
							e.target.checked = false;
							this.ui.showToast("⚠️ Превышен лимит в 50 МВт!", "warning");
						}
					} else {
						this.selectedPower = this.selectedPower.filter(id => id !== option.dataset.id);
						this.currentPower -= power;
					}
					const countEl = document.getElementById("power-count");
					if (countEl) countEl.textContent = this.currentPower;
				});
			});

			const btn = document.getElementById("e2-confirm");
			if (btn) btn.addEventListener("click", () => {
				this.ui.hideModal();
				this.completeTask2();
			});
		}, 50);
	}

	completeTask2() {
		// Правильно: Больница + Жилой район (25 МВт)
		const isCorrect =
			this.selectedPower.length === 2 &&
			this.selectedPower.includes("hospital") &&
			this.selectedPower.includes("residential");

		let score = 0, message = "", errors = 0;

		if (isCorrect) {
			score = 15;
			message = "✅ +15 баллов! Приоритеты расставлены верно — жизнь людей важнее!";
			this.ui.setTaskProgress(2, "completed");
			this.scene.updateLinesColor(0, 0x22c55e);
			this.scene.updateLinesColor(1, 0x22c55e);
		} else if (this.selectedPower.includes("factory")) {
			score = 5;
			message = "⚠️ +5 баллов. Завод — не приоритет. Люди важнее промышленности";
			errors = 1;
			this.ui.setTaskProgress(2, "error");
		} else if (this.selectedPower.length < 2) {
			score = 0;
			message = "❌ Нужно выбрать хотя бы больницу и жилой район";
			errors = 2;
			this.ui.setTaskProgress(2, "error");
		} else {
			score = 5;
			message = "⚠️ Выбраны не все приоритетные объекты. +5 баллов";
			errors = 1;
			this.ui.setTaskProgress(2, "error");
		}

		this.ui.showToast(message, isCorrect ? "success" : "warning");

		if (this.resolveTask2) {
			this.resolveTask2({ score, errors, selectedPower: this.selectedPower });
			this.resolveTask2 = null;
		}
	}

	// ── Задача 3: Авария на ЛЭП ──
	async startTask3() {
		this.ui.showAlert();
		this.ui.setTaskProgress(3, "active");
		this.scene.showSiren();
		this.scene.showFaultLine();

		// Amplify bloom
		if (this.scene.sceneManager.bloomPass) {
			this.scene.sceneManager.bloomPass.strength = 0.8;
		}

		return new Promise(resolve => {
			setTimeout(() => {
				this.resolveTask3 = resolve;
				this.showTask3Modal();
			}, 2000);
		});
	}

	showTask3Modal() {
		this.ui.showInstruction(
			"🚨 АВАРИЯ НА ЛЭП!",
			"Произошло повреждение линии электропередач!\n\nБез света:\n🏭 Хлебозавод (1500 работников)\n🏠 Жилой район (2000 квартир)\n🏫 Школа (1200 учеников)\n\nРемонтная бригада прибудет через ~2 часа.\nВы можете переключить часть потребителей.",
			"Принять решение",
			() => this.showTask3Choices(),
		);
	}

	showTask3Choices() {
		const bodyHTML = `
			<div style="background:#2a1a1a;padding:20px;border-radius:12px;margin-bottom:20px;">
				<h4 style="color:#EF4444;margin-bottom:10px;">🚨 АВАРИЯ НА ЛЭП</h4>
				<p>Повреждена ЛЭП. Без электричества 3 объекта. Как перераспределить?</p>
			</div>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="e3-choice" id="e3c1" value="1">
					<label for="e3c1"><strong>Отключить всех — безопасность превыше всего</strong><br><small style="color:#94A3B8;">Безопасно, но негуманно.</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="e3-choice" id="e3c2" value="2">
					<label for="e3c2"><strong>Отключить хлебозавод, дать свет домам и школе</strong><br><small style="color:#22C55E;">Гуманно! Люди важнее производства.</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="e3-choice" id="e3c3" value="3">
					<label for="e3c3"><strong>Ждать ремонтную бригаду</strong><br><small style="color:#94A3B8;">Неэффективно. Люди без света 2 часа.</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="e3-confirm">✅ ПОДТВЕРДИТЬ РЕШЕНИЕ</button>`;

		this.ui.showModal("Авария на линии электропередач", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("e3-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="e3-choice"]:checked');
				if (selected) {
					this.ui.hideModal();
					this.completeTask3(parseInt(selected.value));
				} else {
					this.ui.showToast("Выберите решение", "warning");
				}
			});
		}, 50);
	}

	completeTask3(choice) {
		let score = 0, message = "";

		this.ui.hideAlert();
		this.scene.hideSiren();

		// Reset bloom
		if (this.scene.sceneManager.bloomPass) {
			this.scene.sceneManager.bloomPass.strength = 0.4;
		}

		switch (choice) {
			case 1:
				score = 5;
				message = "⚠️ +5 баллов. Безопасно, но люди страдают без света";
				this.ui.setTaskProgress(3, "completed");
				break;
			case 2:
				score = 20;
				message = "✅ +20 баллов! Люди важнее производства! Отличное решение!";
				this.ui.setTaskProgress(3, "completed");
				this.scene.updateFaultLineColor(0xf59e0b);
				break;
			case 3:
				score = 0;
				message = "❌ +0 баллов. Нужно действовать, а не ждать!";
				this.ui.setTaskProgress(3, "error");
				break;
		}

		setTimeout(() => this.scene.hideFaultLine(), 3000);

		this.ui.showToast(message, choice === 2 ? "success" : "warning");

		if (this.resolveTask3) {
			this.resolveTask3({ score, choice });
			this.resolveTask3 = null;
		}
	}
}

export default EngineerTasks;
