// InspectorTasks.js — 3 задачи для профессии Инженер КК
export class InspectorTasks {
	constructor(uiManager, inspectionScene, gameState) {
		this.ui = uiManager;
		this.scene = inspectionScene;
		this.gs = gameState;

		this.falseTaps = 0;
		this.foundDefects = [];
		this.markedErrors = [];
		this.resolveTask1 = null;
		this.resolveTask2 = null;
		this.resolveTask3 = null;
		this._task2modalOpen = false;
	}

	// ── Задача 1: Осмотр стены ──
	async startTask1() {
		this.falseTaps = 0;
		this.foundDefects = [];
		this.ui.setTaskProgress(1, "active");
		this.ui.showHint("🔍 Кликайте по стене — ищите трещины, широкие швы, вздутия", 10000);
		this.ui.showClickHint("Осмотри стену 👆");

		this.showInspectionOverlay();

		// Wire finish button
		const fb = document.getElementById("inspect-finish-btn");
		if (fb) {
			const nfb = fb.cloneNode(true);
			fb.parentNode.replaceChild(nfb, fb);
			nfb.addEventListener("click", () => this.finishInspection());
		}

		return new Promise(resolve => { this.resolveTask1 = resolve; });
	}

	onWallZoneClick(zoneIdx) {
		if (!this.resolveTask1) return;

		const zone = this.scene.objects.zones[zoneIdx];
		if (!zone) return;

		if (zone.userData.hasDefect && !zone.userData.defectFound) {
			// Found defect!
			this.scene.showDefect(zoneIdx);
			this.foundDefects.push(zone.userData.defectName);
			const count = this.foundDefects.length;
			this.ui.showToast(`🔍 Найден дефект: ${zone.userData.defectName} (${count}/3)`, "info", 2000);

			// Update counter in overlay
			const counter = document.getElementById("inspect-counter");
			if (counter) counter.textContent = `${count}/3`;

			// Log in journal
			const journal = document.getElementById("inspect-journal");
			if (journal) {
				const entry = document.createElement("div");
				entry.className = "journal-entry";
				entry.innerHTML = `📍 Зона [${zone.userData.zoneRow},${zone.userData.zoneCol}]: ${zone.userData.defectName}`;
				journal.appendChild(entry);
			}

			if (count >= 3) {
				const btn = document.getElementById("inspect-finish-btn");
				if (btn) {
					btn.disabled = false;
					btn.classList.add("pulse-green");
					this.ui.showToast("✅ Все дефекты найдены! Завершите осмотр.", "success");
				}
			}
		} else {
			// False tap
			this.falseTaps++;
			this.ui.showToast("✅ Зона чистая", "info", 500);
		}
	}

	finishInspection() {
		// Count found vs total
		const totalDefects = 3;
		const found = this.foundDefects.length;

		// Close inspection overlay
		this.hideInspectionOverlay();

		// Show result modal
		const defectList = this.foundDefects.map((d, i) =>
			`<tr><td>${i+1}. ${d}</td><td style="color:#ef4444">⚠️</td></tr>`
		).join("");

		const bodyHTML = `
			<h4 style="margin-bottom:15px;">📋 РЕЗУЛЬТАТЫ ОСМОТРА</h4>
			<p>Найдено дефектов: <strong>${found}/${totalDefects}</strong></p>
			<table class="document-table" style="margin:15px 0">
				<tr><th style="color:#000;background:#e0e0e0;">Дефект</th><th style="color:#000;background:#e0e0e0;">Статус</th></tr>
				${defectList || "<tr><td colspan='2'>Ничего не найдено</td></tr>"}
			</table>
			<p style="margin-bottom:15px;color:#94a3b8;">Ложных отметок: ${this.falseTaps}</p>
			<p style="margin-bottom:15px;"><strong>Что делаем с дефектами?</strong></p>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="task1-choice" id="i1c1" value="1">
					<label for="i1c1"><strong>Выдать предписание на устранение</strong><br><small>Остановить участок на 2 часа</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="task1-choice" id="i1c2" value="2">
					<label for="i1c2"><strong>Внести в журнал, продолжить работу</strong><br><small>Некритично, можно подождать</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="task1-choice" id="i1c3" value="3">
					<label for="i1c3"><strong>Принять работу без замечаний</strong><br><small>Поскорее закрыть акт</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="i1-confirm">✅ ПРИНЯТЬ РЕШЕНИЕ</button>`;

		this.ui.showModal("Результаты осмотра", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("i1-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="task1-choice"]:checked');
				if (selected) {
					this.ui.hideModal();
					this.completeTask1(parseInt(selected.value), found);
				} else {
					this.ui.showToast("Выберите вариант решения", "warning");
				}
			});
		}, 50);
	}

	showInspectionOverlay() {
		const overlay = document.getElementById("inspection-overlay");
		if (overlay) {
			overlay.classList.remove("hidden");
			document.getElementById("inspect-counter").textContent = "0/3";
			const journal = document.getElementById("inspect-journal");
			if (journal) journal.innerHTML = "";
			const finishBtn = document.getElementById("inspect-finish-btn");
			if (finishBtn) finishBtn.disabled = true;
		}
	}

	hideInspectionOverlay() {
		const overlay = document.getElementById("inspection-overlay");
		if (overlay) overlay.classList.add("hidden");
	}

	completeTask1(choice, found) {
		let score = 0;

		if (found >= 3 && choice === 1) {
			score = 10;
			this.ui.setTaskProgress(1, "completed");
			this.ui.showToast("✅ +10 баллов! Предписание выдано", "success");
			this.scene.showTape();
		} else if (found >= 2 && choice === 1) {
			score = 7;
			this.ui.setTaskProgress(1, "completed");
			this.ui.showToast("✅ +7 баллов. Часть дефектов найдена", "warning");
		} else if (found >= 3 && choice === 2) {
			score = 5;
			this.ui.setTaskProgress(1, "completed");
			this.ui.showToast("⚠️ +5 баллов. Внесено в журнал", "warning");
		} else if (choice === 3) {
			score = 0;
			this.ui.setTaskProgress(1, "error");
			this.ui.showToast("❌ Трещины в несущей стене нельзя игнорировать!", "error");
		} else {
			score = 0;
			this.ui.setTaskProgress(1, "error");
			this.ui.showToast("❌ Не все дефекты найдены. 0 баллов", "error");
		}

		// Bonus for no false taps
		if (this.falseTaps === 0 && score > 0) {
			score += 3;
			this.ui.showToast("🎯 Бонус «Чистый осмотр» +3 балла!", "success");
		}

		if (this.resolveTask1) {
			this.resolveTask1({ score, choice, found, falseTaps: this.falseTaps });
			this.resolveTask1 = null;
		}
	}

	// ── Задача 2: Проверка документации ──
	async startTask2() {
		this.markedErrors = [];
		this.ui.setTaskProgress(2, "active");
		this.ui.showHint("📋 Проверьте акт скрытых работ — найдите несоответствия", 10000);
		this.ui.showClickHint("Нажмите на ДОКУМЕНТЫ в HUD");

		this.showDocPanel();

		return new Promise(resolve => { this.resolveTask2 = resolve; });
	}

	showDocPanel() {
		const panel = document.getElementById("doc-check-panel");
		if (panel) {
			panel.classList.remove("hidden");
			this._task2modalOpen = true;
			document.querySelectorAll(".doc-row").forEach(row => {
				row.classList.remove("marked-error");
				const cb = row.querySelector(".doc-radio");
				if (cb) cb.checked = false;
			});
			document.getElementById("doc-error-count").textContent = "0";
			document.getElementById("doc-confirm-btn").disabled = true;

			// Wire doc confirm
			const docBtn = document.getElementById("doc-confirm-btn");
			if (docBtn) {
				const nd = docBtn.cloneNode(true);
				docBtn.parentNode.replaceChild(nd, docBtn);
				nd.addEventListener("click", () => this.finishDocCheck());
			}

			// Wire doc checkboxes
			document.querySelectorAll(".doc-row[data-idx] .doc-radio").forEach(cb => {
				cb.addEventListener("change", (e) => {
					const row = e.target.closest(".doc-row");
					if (row) this.toggleDocError(parseInt(row.dataset.idx));
				});
			});
		}
	}

	hideDocPanel() {
		const panel = document.getElementById("doc-check-panel");
		if (panel) panel.classList.add("hidden");
		this._task2modalOpen = false;
	}

	toggleDocError(rowIdx) {
		const rows = document.querySelectorAll(".doc-row");
		if (rowIdx < 0 || rowIdx >= rows.length) return;

		const row = rows[rowIdx];
		const isChecked = row.querySelector(".doc-radio").checked;

		if (isChecked) {
			row.classList.add("marked-error");
			if (!this.markedErrors.includes(rowIdx)) this.markedErrors.push(rowIdx);
		} else {
			row.classList.remove("marked-error");
			this.markedErrors = this.markedErrors.filter(i => i !== rowIdx);
		}

		document.getElementById("doc-error-count").textContent = this.markedErrors.length;
		document.getElementById("doc-confirm-btn").disabled = this.markedErrors.length === 0;
	}

	finishDocCheck() {
		this.hideDocPanel();

		// Correct errors: row 0 (diameter 10mm vs 12mm), row 2 (M200 vs M300), row 5 (no KK signature)
		const correctErrors = [0, 2, 5];
		const foundCorrect = correctErrors.filter(i => this.markedErrors.includes(i)).length;
		const falseMarks = this.markedErrors.filter(i => !correctErrors.includes(i)).length;
		this.falseTaps += falseMarks;

		// Decision form
		const bodyHTML = `
			<h4 style="margin-bottom:15px;">Найдено несоответствий: ${this.markedErrors.length}</h4>
			<p style="margin-bottom:15px;">Из них верных: ${foundCorrect}/3</p>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="task2-choice" id="i2c1" value="1">
					<label for="i2c1"><strong>Отказать в подписании акта</strong><br><small>Вернуть бригаде на исправление</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="task2-choice" id="i2c2" value="2">
					<label for="i2c2"><strong>Подписать акт с замечаниями</strong><br><small>Исправят потом</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="task2-choice" id="i2c3" value="3">
					<label for="i2c3"><strong>Подписать без замечаний</strong><br><small>Прораб просит не задерживать</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="i2-confirm">✅ УТВЕРДИТЬ РЕШЕНИЕ</button>`;

		this.ui.showModal("Заключение по акту", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("i2-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="task2-choice"]:checked');
				if (selected) {
					this.ui.hideModal();
					this.completeTask2(parseInt(selected.value), foundCorrect);
				} else {
					this.ui.showToast("Выберите решение", "warning");
				}
			});
		}, 50);

		// Bonus time tracking is handled externally
	}

	completeTask2(choice, foundCorrect) {
		let score = 0;

		if (foundCorrect >= 3 && choice === 1) {
			score = 15;
			this.ui.setTaskProgress(2, "completed");
			this.ui.showToast("✅ +15 баллов! Акт возвращён на доработку", "success");
		} else if (foundCorrect >= 2 && choice === 1) {
			score = 10;
			this.ui.setTaskProgress(2, "completed");
			this.ui.showToast("✅ +10 баллов. Частично верно", "warning");
		} else if (foundCorrect >= 3 && choice === 2) {
			score = 5;
			this.ui.setTaskProgress(2, "completed");
			this.ui.showToast("⚠️ +5 баллов. Подписано с замечаниями", "warning");
		} else if (choice === 3) {
			score = 0;
			this.ui.setTaskProgress(2, "error");
			this.ui.showToast("❌ Некачественный бетон М200 не выдержит нагрузки!", "error");
		} else {
			score = 0;
			this.ui.setTaskProgress(2, "error");
			this.ui.showToast("❌ Не все ошибки найдены", "error");
		}

		if (this.resolveTask2) {
			this.resolveTask2({ score, choice, found: foundCorrect });
			this.resolveTask2 = null;
		}
	}

	// ── Задача 3: Звонок заказчика ──
	async startTask3() {
		this.ui.showAlert();
		this.ui.setTaskProgress(3, "active");
		this.scene.startPhoneBlink();

		return new Promise(resolve => {
			setTimeout(() => {
				this.resolveTask3 = resolve;
				this.showTask3Modal();
			}, 2000);
		});
	}

	showTask3Modal() {
		this.ui.showInstruction(
			"📞 ЗВОНОК ОТ ЗАКАЗЧИКА",
			"Директор компании «СтройМонолит»:\n\n«Инженер! Завтра сдача объекта. Бетон ещё не набрал прочность — нужно 28 дней, а прошло 7. Директор требует подписать акт приёмки СЕГОДНЯ. Иначе штраф 2 млн руб.»\n\nЧто будете делать?",
			"Принять решение",
			() => this.showTask3Choices(),
		);
	}

	showTask3Choices() {
		const bodyHTML = `
			<div style="background:#1a2a1a;padding:20px;border-radius:12px;margin-bottom:20px;">
				<h4 style="color:#16a34a;margin-bottom:10px;">📞 ЗВОНОК ОТ ЗАКАЗЧИКА</h4>
				<p>Директор требует подписать акт приёмки сегодня. Бетону всего 7 дней вместо 28 по СНиП.</p>
			</div>
			<div class="choice-options">
				<div class="choice-option" data-choice="1">
					<input type="radio" name="t3-choice" id="it3c1" value="1">
					<label for="it3c1"><strong>Отказать в подписании</strong><br><small style="color:#22C55E;">По СНиП бетон должен выстоять 28 суток</small></label>
				</div>
				<div class="choice-option" data-choice="2">
					<input type="radio" name="t3-choice" id="it3c2" value="2">
					<label for="it3c2"><strong>Подписать под давлением</strong><br><small style="color:#94A3B8;">Компания важнее нормативов</small></label>
				</div>
				<div class="choice-option" data-choice="3">
					<input type="radio" name="t3-choice" id="it3c3" value="3">
					<label for="it3c3"><strong>Запросить лабораторную проверку</strong><br><small style="color:#94A3B8;">Займёт 4 часа</small></label>
				</div>
			</div>
		`;

		const footerHTML = `<button class="btn btn-primary" id="it3-confirm">✅ ПРИНЯТЬ РЕШЕНИЕ</button>`;

		this.ui.showModal("Звонок от заказчика", bodyHTML, footerHTML);

		setTimeout(() => {
			const btn = document.getElementById("it3-confirm");
			if (btn) btn.addEventListener("click", () => {
				const selected = document.querySelector('input[name="t3-choice"]:checked');
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
		this.scene.stopPhoneBlink();

		switch (choice) {
			case 1:
				score = 20;
				message = "✅ +20 баллов! Инженер КК отвечает за безопасность людей!";
				this.ui.setTaskProgress(3, "completed");
				break;
			case 2:
				score = 0;
				message = "❌ Преждевременная нагрузка на бетон — причина обрушений!";
				this.ui.setTaskProgress(3, "error");
				break;
			case 3:
				score = 10;
				message = "✅ +10 баллов. Хороший подход, но норматив уже нарушен";
				this.ui.setTaskProgress(3, "completed");
				break;
		}

		this.ui.showToast(message, choice === 1 ? "success" : choice === 3 ? "success" : "warning");

		if (this.resolveTask3) {
			this.resolveTask3({ score, choice });
			this.resolveTask3 = null;
		}
	}
}

export default InspectorTasks;
