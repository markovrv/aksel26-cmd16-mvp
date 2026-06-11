// UIManager.js — Полное управление HTML-оверлеями и UI
import gsap from "gsap";

export class UIManager {
	constructor() {
		this.el = id => document.getElementById(id);
		this.qs = sel => document.querySelector(sel);
		this.qsa = sel => document.querySelectorAll(sel);

		this.timerInterval = null;
		this.timerSeconds = 0;
		this.resolveTask = null;
	}

	// ── Loading ──
	showLoading(text = "Загрузка...") {
		this.el("loading-screen")?.classList.remove("hidden");
		this.el("loading-progress").textContent = text;
	}

	hideLoading() {
		this.el("loading-screen")?.classList.add("hidden");
	}

	// ── Entry / Start ──
	showStartScreen() {
		this.el("start-screen")?.classList.remove("hidden");
	}

	hideStartScreen() {
		this.el("start-screen")?.classList.add("hidden");
	}

	showEntryScreen() {
		const screen = this.el("entry-screen");
		if (screen) { screen.classList.remove("hidden"); screen.style.display = "flex"; }
	}

	hideEntryScreen() {
		const screen = this.el("entry-screen");
		if (screen) { screen.classList.add("hidden"); screen.style.display = "none"; }
	}

	showIntroScreen() {
		const screen = this.el("intro-screen");
		if (screen) { screen.classList.remove("hidden"); screen.style.display = "flex"; }
	}

	hideIntroScreen() {
		const screen = this.el("intro-screen");
		if (screen) { screen.classList.add("hidden"); screen.style.display = "none"; }
	}

	// ── HUD ──
	showHUD() { this.el("hud")?.classList.remove("hidden"); }
	hideHUD() { this.el("hud")?.classList.add("hidden"); }

	updateHUD({ player, profession, score, task }) {
		if (this.el("hud-player")) this.el("hud-player").textContent = player || "Игрок";
		if (this.el("hud-profession")) this.el("hud-profession").textContent = profession || "—";
		if (this.el("hud-score")) this.el("hud-score").textContent = score ?? 0;
		if (this.el("hud-task")) this.el("hud-task").textContent = task ?? 1;
	}

	animateScore(newScore) {
		const el = this.el("hud-score");
		if (el) {
			gsap.fromTo(el, { scale: 1.3, color: "#22C55E" }, { scale: 1, color: "#FFFFFF", duration: 0.5 });
			el.textContent = newScore;
		}
	}

	// ── Timer ──
	startTimer() {
		this.timerSeconds = 0;
		this.stopTimer();
		this.timerInterval = setInterval(() => {
			this.timerSeconds++;
			const m = Math.floor(this.timerSeconds / 60);
			const s = this.timerSeconds % 60;
			if (this.el("timer-display")) {
				this.el("timer-display").textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
			}
		}, 1000);
	}

	stopTimer() {
		if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
	}

	// ── Progress indicators ──
	setTaskProgress(taskNum, status) {
		const item = document.querySelector(`.progress-item[data-task="${taskNum}"]`);
		if (!item) return;
		item.classList.remove("active", "completed", "error");
		if (status) item.classList.add(status);
	}

	// ── Hint box ──
	showHint(text, duration = 5000) {
		const box = this.el("hint-box");
		const txt = this.el("hint-text");
		if (!box || !txt) return;
		txt.textContent = text;
		box.classList.remove("hidden");
		gsap.fromTo(box, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
		clearTimeout(box._hintTimeout);
		box._hintTimeout = setTimeout(() => {
			gsap.to(box, { opacity: 0, y: 20, duration: 0.3, onComplete: () => box.classList.add("hidden") });
		}, duration);
	}

	hideHint() { this.el("hint-box")?.classList.add("hidden"); }

	// ── Alert (ЧП) ──
	showAlert() {
		const el = this.el("alert-indicator");
		if (el) { el.classList.remove("hidden"); el.style.animation = "pulse 0.5s ease infinite alternate"; }
	}

	hideAlert() { this.el("alert-indicator")?.classList.add("hidden"); }

	// ── Click hint ──
	showClickHint(text = "Нажмите на объект") {
		const el = this.el("click-hint");
		const txt = this.el("click-hint-text");
		if (txt) txt.textContent = text;
		if (el) el.classList.remove("hidden");
	}

	hideClickHint() { this.el("click-hint")?.classList.add("hidden"); }

	// ── Modal ──
	showModal(title, bodyHTML, footerHTML = "") {
		if (this.el("modal-title")) this.el("modal-title").textContent = title;
		if (this.el("modal-body")) this.el("modal-body").innerHTML = bodyHTML;
		if (this.el("modal-footer")) this.el("modal-footer").innerHTML = footerHTML;
		const container = this.el("modal-container");
		if (container) {
			container.classList.remove("hidden");
			gsap.fromTo(container.querySelector(".modal-content"),
				{ opacity: 0, y: -30, scale: 0.95 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
		}
	}

	hideModal() {
		const container = this.el("modal-container");
		if (container) {
			gsap.to(container.querySelector(".modal-content"), {
				opacity: 0, y: -30, scale: 0.95, duration: 0.2,
				onComplete: () => container.classList.add("hidden"),
			});
		}
	}

	// ── Instruction overlay ──
	showInstruction(title, text, buttonText = "Понятно!", onClose = null) {
		const container = this.el("scene-instructions");
		const titleEl = this.el("instruction-title");
		const textEl = this.el("instruction-text");
		const btnEl = this.el("instruction-btn");
		if (titleEl) titleEl.textContent = title;
		if (textEl) textEl.innerHTML = text.replace(/\n/g, "<br>");
		if (btnEl) {
			btnEl.textContent = buttonText;
			const newBtn = btnEl.cloneNode(true);
			btnEl.parentNode.replaceChild(newBtn, btnEl);
			newBtn.addEventListener("click", () => {
				this.hideInstruction();
				if (onClose) onClose();
			});
		}
		if (container) {
			container.classList.remove("hidden");
			container.style.display = "flex";
			gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.3 });
		}
	}

	hideInstruction() {
		const container = this.el("scene-instructions");
		if (container) container.classList.add("hidden");
	}

	// ── Task Panel (drag & drop) ──
	showTaskPanel(workers, onConfirm, onCancel) {
		const panel = this.el("task-panel");
		if (panel) panel.classList.remove("hidden");

		const container = this.el("workers-container");
		if (container) {
			container.innerHTML = workers.map((w, i) => `
				<div class="worker-card" draggable="true" data-worker="${i}" data-name="${w.name}" data-role="${w.role}">
					<div class="worker-avatar" style="background:${w.color}">${w.name[0]}</div>
					<div class="worker-info">
						<div class="worker-name">${w.name}</div>
						<div class="worker-role">${w.role}</div>
					</div>
				</div>
			`).join("");
		}

		// Clear zones
		document.querySelectorAll(".zone-drop-area").forEach(area => area.innerHTML = "");

		this._confirmCb = onConfirm;
		this._cancelCb = onCancel;

		const confirmBtn = this.el("confirm-task");
		const cancelBtn = this.el("cancel-task");

		const newConfirm = confirmBtn.cloneNode(true);
		confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
		newConfirm.addEventListener("click", () => {
			this.hideTaskPanel();
			if (this._confirmCb) this._confirmCb();
		});

		const newCancel = cancelBtn.cloneNode(true);
		cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
		newCancel.addEventListener("click", () => {
			this.hideTaskPanel();
			if (this._cancelCb) this._cancelCb();
		});

		this.setupDragDrop();
	}

	hideTaskPanel() { this.el("task-panel")?.classList.add("hidden"); }

	setupDragDrop() {
		const cards = document.querySelectorAll(".worker-card");
		const zones = document.querySelectorAll(".zone");
		let dragged = null;

		cards.forEach(card => {
			card.addEventListener("dragstart", e => {
				dragged = card;
				card.classList.add("dragging");
				e.dataTransfer.effectAllowed = "move";
			});
			card.addEventListener("dragend", () => {
				card.classList.remove("dragging");
				dragged = null;
			});
		});

		zones.forEach(zone => {
			const dropArea = zone.querySelector(".zone-drop-area");
			zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drag-over"); });
			zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
			zone.addEventListener("drop", e => {
				e.preventDefault();
				zone.classList.remove("drag-over");
				if (!dragged || !dropArea) return;
				// Check max capacity
				const maxSlots = zone.dataset.zone === "foundation" ? 2 : 3;
				if (dropArea.children.length >= maxSlots) {
					this.showToast("Зона заполнена! Сначала уберите рабочего.", "warning");
					return;
				}
				const clone = dragged.cloneNode(true);
				clone.classList.add("placed");
				clone.draggable = false;
				dropArea.appendChild(clone);
				dragged.classList.add("placed");
				dragged.draggable = false;
			});
		});
	}

	getWorkerAssignments() {
		const assignments = { foundation: [], walls: [] };
		document.querySelectorAll(".zone-drop-area .worker-card.placed").forEach(card => {
			const idx = parseInt(card.dataset.worker);
			const zone = card.closest(".zone")?.dataset.zone;
			if (zone && assignments[zone] !== undefined) assignments[zone].push(idx);
		});
		return assignments;
	}

	// ── Toast ──
	showToast(message, type = "success", duration = 3000) {
		const container = this.el("toast-container");
		if (!container) return;
		const icons = { success: "✅", warning: "⚠️", error: "❌", info: "💡" };
		const toast = document.createElement("div");
		toast.className = `toast ${type}`;
		toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
		container.appendChild(toast);
		gsap.fromTo(toast, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.3 });
		setTimeout(() => {
			gsap.to(toast, { opacity: 0, x: 50, duration: 0.3, onComplete: () => toast.remove() });
		}, duration);
	}

	// ── Fade transitions ──
	fadeOut(duration = 0.3) {
		return new Promise(resolve => {
			const overlay = this.el("fade-overlay");
			if (overlay) { overlay.classList.add("active"); overlay.style.opacity = "1"; }
			gsap.to(overlay, { opacity: 1, duration, onComplete: resolve });
		});
	}

	fadeIn(duration = 0.3) {
		return new Promise(resolve => {
			const overlay = this.el("fade-overlay");
			gsap.to(overlay, { opacity: 0, duration, onComplete: () => {
				overlay.classList.remove("active");
				resolve();
			}});
		});
	}

	// ── Results screen ──
	showResults(score, time, achievements, onPDF, onRetry, onSwitch) {
		const screen = this.el("results-screen");
		if (!screen) return;
		screen.classList.remove("hidden");

		// Animate score counter
		const scoreEl = this.el("final-score");
		if (scoreEl) {
			const target = score;
			let current = 0;
			const startTime = performance.now();
			const animateCounter = () => {
				const elapsed = performance.now() - startTime;
				const progress = Math.min(elapsed / 2000, 1);
				current = Math.round(progress * target);
				scoreEl.textContent = current;
				if (progress < 1) requestAnimationFrame(animateCounter);
			};
			setTimeout(animateCounter, 500);
		}

		if (this.el("final-time")) this.el("final-time").textContent = time;

		// Render achievements
		const grid = this.el("achievements-container")?.querySelector(".achievements-grid");
		if (grid && achievements?.length > 0) {
			grid.innerHTML = achievements.map((a, i) => `
				<div class="achievement-card" style="animation-delay:${i * 0.2}s">
					<div class="achievement-icon">${a.icon}</div>
					<div class="achievement-name">${a.name}</div>
				</div>
			`).join("");
		}

		// Skills stars animation
		document.querySelectorAll(".skill-stars .star").forEach((star, i) => {
			setTimeout(() => {
				star.classList.add("active");
				gsap.fromTo(star, { scale: 0, rotate: -180 }, { scale: 1, rotate: 0, duration: 0.3 });
			}, 1000 + i * 200);
		});

		// Confetti
		this.createConfetti();

		// Button handlers
		["btn-pdf", "btn-retry", "btn-switch"].forEach(id => {
			const btn = this.el(id);
			if (!btn) return;
			const newBtn = btn.cloneNode(true);
			btn.parentNode.replaceChild(newBtn, btn);
		});

		if (this.el("btn-pdf")) {
			this.el("btn-pdf").addEventListener("click", () => { if (onPDF) onPDF(); });
		}
		if (this.el("btn-retry")) {
			this.el("btn-retry").addEventListener("click", () => { if (onRetry) onRetry(); });
		}
		if (this.el("btn-switch")) {
			this.el("btn-switch").addEventListener("click", () => { if (onSwitch) onSwitch(); });
		}
	}

	hideResultsScreen() {
		this.el("results-screen")?.classList.add("hidden");
	}

	// ── Reset all transient UI (alerts, hints, toasts, timer) ──
	resetAll() {
		this.stopTimer();
		this.hideHint();
		this.hideAlert();
		this.hideClickHint();
		// Clear toasts
		const container = this.el("toast-container");
		if (container) container.innerHTML = "";
		// Reset progress indicators
		document.querySelectorAll(".progress-item").forEach(el => {
			el.classList.remove("active", "completed", "error");
		});
	}

	createConfetti() {
		const container = this.el("confetti-container");
		if (!container) return;
		container.innerHTML = "";
		const colors = ["#FF6B35","#2563EB","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6"];
		for (let i = 0; i < 150; i++) {
			const c = document.createElement("div");
			c.className = "confetti";
			c.style.left = `${Math.random() * 100}%`;
			c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
			c.style.animationDelay = `${Math.random() * 2}s`;
			c.style.animationDuration = `${2 + Math.random() * 2}s`;
			const size = 5 + Math.random() * 10;
			c.style.width = `${size}px`;
			c.style.height = `${size}px`;
			c.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
			container.appendChild(c);
		}
		setTimeout(() => container.innerHTML = "", 6000);
	}
}

export default UIManager;
