// PDFExporter.js — Генерация PDF-портфолио с поддержкой кириллицы
// Использует canvas для рендеринга каждого блока целиком (без растекания)
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export class PDFExporter {
	constructor() {
		this.doc = null;
	}

	/** Нарисовать блок текста на canvas, вернуть dataURL + размеры */
	renderBlock(text, opts = {}) {
		const {
			fontSize = 11,
			color = "#000000",
			bold = false,
			align = "left",
			widthPx = 640,      // ширина в пикселях
			lineHeight = 1.35,
		} = opts;

		const fontFamily = "Inter, Montserrat, Arial, Helvetica, sans-serif";
		const fontWeight = bold ? "bold" : "normal";

		// 1. Временный canvas для измерения
		const meas = document.createElement("canvas");
		const mctx = meas.getContext("2d");
		mctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

		const words = String(text).split(" ");
		const lines = [];
		let cur = "";
		for (const w of words) {
			const test = cur ? cur + " " + w : w;
			if (mctx.measureText(test).width > widthPx - 12) {
				lines.push(cur);
				cur = w;
			} else {
				cur = test;
			}
		}
		if (cur) lines.push(cur);

		const lineH = Math.ceil(fontSize * lineHeight);
		const totalH = lines.length * lineH + 12; // 6px padding top/bottom
		const w = widthPx;
		const h = totalH;
		const dpr = 2;

		// 2. Финальный canvas
		const canvas = document.createElement("canvas");
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		const ctx = canvas.getContext("2d");
		ctx.scale(dpr, dpr);
		ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
		ctx.fillStyle = color;
		ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
		ctx.textBaseline = "top";

		const startX = align === "center" ? w / 2 : align === "right" ? w - 6 : 6;
		let y = 6;
		for (const line of lines) {
			ctx.fillText(line, startX, y);
			y += lineH;
		}

		return { dataUrl: canvas.toDataURL("image/png"), w, h };
	}

	/** Вспомогатель — вставить блок текста в PDF */
	addTextBlock(text, x_mm, y_mm, opts = {}) {
		const { w_mm, fontSize, color, bold, align, lineHeight } = opts;
		const widthPx = (w_mm || 170) * 3.78;
		const fs = fontSize || 11;
		const { dataUrl, w, h } = this.renderBlock(text, {
			fontSize: fs,
			color: color || "#000000",
			bold: !!bold,
			align: align || "left",
			widthPx,
			lineHeight: lineHeight || 1.35,
		});
		if (!dataUrl) return 0;
		const h_mm = (h / w) * (w_mm || 170);
		try {
			this.doc.addImage(dataUrl, "PNG", x_mm, y_mm, w_mm || 170, h_mm);
		} catch (e) {
			// fallback
		}
		return h_mm;
	}

	async generate(gameState, profession) {
		this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

		const { playerName, totalScore, taskTimes, achievements, scores } = gameState;
		const profNames = { foreman: 'Прораб', engineer: 'Инженер-энергетик', inspector: 'Инженер КК' };
		const professionName = profNames[profession] || 'Прораб';

		// Цвета
		const primaryHex = profession === "foreman" ? "#FF6B35" : "#2563EB";
		const pR = profession === "foreman" ? 255 : 37;
		const pG = profession === "foreman" ? 107 : 99;
		const pB = profession === "foreman" ? 53 : 235;

		const W = 170; // ширина контента в мм
		const L = 20;  // левый отступ

		let y = 15;

		// ── Шапка ──
		this.doc.setFillColor(pR, pG, pB);
		this.doc.rect(0, 0, 210, 38, "F");

		y += this.addTextBlock("Профориентационный паспорт", L, y, {
			w_mm: W, fontSize: 20, bold: true, color: "#FFFFFF", align: "center",
		});
		y += this.addTextBlock('Образовательная 3D-игра "Выберем профессию"', L, y, {
			w_mm: W, fontSize: 10, color: "#FFFFFF", align: "center",
		});
		y += 4;

		// ── Инфо ──
		y += this.addTextBlock(`Участник: ${playerName}`, L, y, { w_mm: W, fontSize: 13, bold: true });
		y += this.addTextBlock(`Дата прохождения: ${new Date().toLocaleDateString("ru-RU")}`, L, y, { w_mm: W, fontSize: 10 });
		y += this.addTextBlock(`Профессия: ${professionName}`, L, y, { w_mm: W, fontSize: 10 });
		y += 4;

		// ── Результат ──
		this.doc.setFillColor(240, 240, 240);
		this.doc.rect(L, y, W, 22, "F");

		y += this.addTextBlock("Итоговый результат:", L + 5, y + 1, { w_mm: 80, fontSize: 11, bold: true });
		this.addTextBlock(`${totalScore} / 55`, L + 5, y - 2, { w_mm: 150, fontSize: 22, bold: true, color: primaryHex, align: "right" });
		y += 5;

		let grade = totalScore >= 40
			? "Отлично! Рекомендовано для экскурсии на предприятие."
			: totalScore >= 25
				? "Хороший результат. Есть потенциал для развития."
				: "Рекомендуется попробовать ещё раз для лучшего результата.";
		y += this.addTextBlock(grade, L + 5, y + 1, { w_mm: 155, fontSize: 9, color: "#555555" });

		y += 8;

		// ── Навыки ──
		y += this.addTextBlock("Оценённые навыки", L, y, { w_mm: W, fontSize: 14, bold: true });
		y += 2;

		const skillData = [
			{ name: "Организаторские способности", stars: Math.min(3, Math.ceil(totalScore / 15)) },
			{ name: "Принятие решений", stars: Math.min(3, Math.ceil(Math.max(1, (totalScore || 1) % 20) / 7)) },
			{ name: "Управление временем", stars: Math.min(3, Math.ceil(Math.max(1, (totalScore || 1) % 10) / 4)) },
		];

		for (const skill of skillData) {
			y += this.addTextBlock(skill.name, L + 5, y, { w_mm: 100, fontSize: 10 });
			const stars = "★".repeat(skill.stars) + "☆".repeat(3 - skill.stars);
			this.addTextBlock(stars, L + 5, y - 1, { w_mm: 155, fontSize: 14, color: primaryHex, align: "right" });
			y += 1;
		}
		y += 6;

		// ── Таблица задач ──
		y += this.addTextBlock("Результаты по задачам", L, y, { w_mm: W, fontSize: 14, bold: true });
		y += 3;

		// Заголовки таблицы
		this.doc.setFillColor(pR, pG, pB);
		this.doc.rect(L, y, W, 7, "F");
		const th = ["Задача", "Очки", "Время", "Статус"];
		const tx = [L + 5, L + 85, L + 115, L + 145];
		const tw = [60, 25, 25, 20];
		for (let i = 0; i < 4; i++) {
			this.addTextBlock(th[i], tx[i], y + 1, { w_mm: tw[i], fontSize: 9, bold: true, color: "#FFFFFF" });
		}
		y += 7;

		const taskNames = ["Задача 1", "Задача 2", "Задача 3"];
		const taskScores = [scores.task1, scores.task2, scores.task3];

		for (let i = 0; i < 3; i++) {
			const bg = i % 2 === 0 ? 252 : 245;
			this.doc.setFillColor(bg, bg, bg);
			this.doc.rect(L, y, W, 7, "F");

			this.addTextBlock(taskNames[i], L + 5, y + 1, { w_mm: 60, fontSize: 9 });
			this.addTextBlock(`${taskScores[i]}`, L + 85, y + 1, { w_mm: 25, fontSize: 9 });
			const secs = Math.round((taskTimes[i] || 0) / 1000);
			this.addTextBlock(`${secs} сек`, L + 115, y + 1, { w_mm: 25, fontSize: 9 });
			const ok = taskScores[i] > 0;
			this.addTextBlock(ok ? "✓" : "✗", L + 145, y + 1, {
				w_mm: 20, fontSize: 9, color: ok ? "#22C55E" : "#EF4444",
			});
			y += 7;
		}

		y += 4;

		// ── Достижения ──
		if (achievements && achievements.length > 0) {
			y += this.addTextBlock("Достижения", L, y, { w_mm: W, fontSize: 14, bold: true });
			y += 2;

			const names = {
				quick_solver: "⚡ Быстрый решатель",
				perfectionist: "💎 Перфекционист",
				found_solution: "🔧 Нашёл решение",
				responsible: "📊 Ответственный диспетчер",
				ethical: "🤝 Этичный работник",
				honest_inspector: "🔬 Честный инспектор",
				master_builder: "🏆 Мастер строительной отрасли",
			};

			for (const id of achievements) {
				const n = names[id] || id;
				y += this.addTextBlock(`• ${n}`, L + 5, y, { w_mm: W - 10, fontSize: 9, color: primaryHex });
			}
			y += 4;
		}

		// ── Рекомендации ──
		this.doc.setFillColor(240, 248, 255);
		this.doc.rect(L, y, W, 28, "F");

		y += this.addTextBlock("Рекомендации", L + 5, y + 2, { w_mm: W - 10, fontSize: 12, bold: true, color: primaryHex });

		let rec = totalScore >= 40
			? `Поздравляем! ${playerName} показал отличные результаты. Рекомендуется посетить реальное предприятие для знакомства с профессией изнутри.`
			: totalScore >= 25
				? `${playerName} демонстрирует хороший потенциал. Стоит пройти симуляцию ещё раз для закрепления навыков.`
				: `Рекомендуем ${playerName} попробовать обе профессии и сравнить результаты. Каждая попытка помогает лучше понять свои сильные стороны.`;

		y += this.addTextBlock(rec, L + 5, y + 4, { w_mm: W - 10, fontSize: 9, color: "#333333" });

		y += 32;

		// ── QR-код ──
		try {
			const qrUrl = await QRCode.toDataURL("https://promto.ai/profile", { width: 200, margin: 1 });
			this.doc.addImage(qrUrl, "PNG", L, y, 22, 22);
			this.addTextBlock("Ссылка на профиль:", L + 25, y + 6, { w_mm: 60, fontSize: 8, color: "#666666" });
		} catch (_) { /* ignore */ }

		// ── Подвал ──
		this.addTextBlock('Создано с помощью образовательной 3D-игры "Выберем профессию"', L, 282, {
			w_mm: W, fontSize: 7, color: "#888888", align: "center",
		});

		// Сохранить
		const filename = `Prof_${playerName}_${professionName}_${Date.now()}.pdf`;
		this.doc.save(filename);
		return filename;
	}
}

export default PDFExporter;
