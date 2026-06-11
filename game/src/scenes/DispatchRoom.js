// DispatchRoom.js — Диспетчерская (Инженер-энергетик)
import * as THREE from "three";

export class DispatchRoom {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("engineer");

		this.objects = {};
		this.clickableObjects = [];
		this.blinkIntervals = [];

		this.init();
	}

	init() {
		this.createRoom();
		this.createConsoles();
		this.createMainPanel();
		this.createMonitors();
		this.createNetworkDiagram();
		this.createSiren();
		this.setupCamera();
	}

	createRoom() {
		const g = this.group;

		// Floor
		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(15, 12),
			new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.8, metalness: 0.2 }),
		);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		g.add(floor);

		// Ceiling
		const ceiling = new THREE.Mesh(
			new THREE.PlaneGeometry(15, 12),
			new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: 0.9 }),
		);
		ceiling.rotation.x = Math.PI / 2;
		ceiling.position.y = 4;
		g.add(ceiling);

		// Walls
		const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.8 });
		const backWall = new THREE.Mesh(new THREE.PlaneGeometry(15, 4), wallMat);
		backWall.position.set(0, 2, -6);
		g.add(backWall);

		const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), wallMat);
		leftWall.position.set(-7.5, 2, 0);
		leftWall.rotation.y = Math.PI / 2;
		g.add(leftWall);

		const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), wallMat);
		rightWall.position.set(7.5, 2, 0);
		rightWall.rotation.y = -Math.PI / 2;
		g.add(rightWall);

		// Ceiling light
		const ceilLight = new THREE.PointLight(0xffffee, 1.5, 15);
		ceilLight.position.set(0, 3.8, -2);
		g.add(ceilLight);

		// Grid on floor (decoration)
		const grid = new THREE.GridHelper(15, 20, 0x2244aa, 0x112244);
		grid.position.y = 0.01;
		g.add(grid);

		this.objects.room = { floor, ceiling, backWall, leftWall, rightWall };
	}

	createConsoles() {
		const g = this.group;
		const consoleMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.7, metalness: 0.5 });

		const positions = [[-5, 0, -3], [5, 0, -3], [-5, 0, 3], [5, 0, 3]];
		positions.forEach(pos => {
			const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1), consoleMat);
			desk.position.set(pos[0], 0.05, pos[1]);
			desk.receiveShadow = true;
			g.add(desk);

			const light = new THREE.PointLight(0x2244aa, 0.2, 3);
			light.position.set(pos[0], 0.5, pos[1]);
			g.add(light);
		});
	}

	createMainPanel() {
		const g = this.group;

		// Panel
		const panelMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.3, metalness: 0.8 });
		const panel = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 0.2), panelMat);
		panel.position.set(0, 2, -5.5);
		panel.castShadow = true;
		g.add(panel);

		// Substations
		const indicatorData = [
			{ name: "ПС №1", color: 0x22c55e, load: 45, pos: [-1.5, 1, -5.35] },
			{ name: "ПС №2", color: 0xf59e0b, load: 78, pos: [0, 1, -5.35], status: "overload" },
			{ name: "ПС №3", color: 0x22c55e, load: 23, pos: [1.5, 1, -5.35] },
		];

		this.objects.substations = [];
		indicatorData.forEach((data) => {
			const sphereMat = new THREE.MeshStandardMaterial({
				color: data.color, emissive: data.color, emissiveIntensity: 0.5,
				roughness: 0.3, metalness: 0.5,
			});
			const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), sphereMat);
			sphere.position.set(data.pos[0], data.pos[1], data.pos[2]);
			g.add(sphere);

			const light = new THREE.PointLight(data.color, 0.5, 2);
			light.position.set(data.pos[0], data.pos[1], data.pos[2]);
			g.add(light);

			// Label
			const canvas = document.createElement("canvas");
			canvas.width = 256; canvas.height = 64;
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = "#FFFFFF";
			ctx.font = "bold 24px Montserrat";
			ctx.textAlign = "center";
			ctx.fillText(data.name, 128, 24);
			ctx.font = "18px Inter";
			ctx.fillText(`${data.load}%`, 128, 48);

			const tex = new THREE.CanvasTexture(canvas);
			const labelMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
			const label = new THREE.Sprite(labelMat);
			label.position.set(data.pos[0], data.pos[1] - 0.5, data.pos[2] + 0.1);
			label.scale.set(1.5, 0.375, 1);
			g.add(label);

			const substation = { mesh: sphere, light, material: sphereMat, data, label };
			this.objects.substations.push(substation);
			this.clickableObjects.push(sphere);

			if (data.status === "overload") {
				this.objects.overloadIndicator = substation;
			}
		});

		// Frame
		const frame = new THREE.Mesh(
			new THREE.BoxGeometry(5.2, 3.7, 0.1),
			new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.6 }),
		);
		frame.position.set(0, 2, -5.55);
		g.add(frame);
	}

	createMonitors() {
		const g = this.group;
		const monitorData = [
			{ x: -4, title: "НАГРУЗКА" },
			{ x: 0, title: "ГРАФИКИ" },
			{ x: 4, title: "СОБЫТИЯ" },
		];

		this.objects.monitors = [];
		this.objects.monitorCanvasTextures = [];

		monitorData.forEach(data => {
			const frameMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5 });
			const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.1), frameMat);
			frame.position.set(data.x, 2, -5.4);
			g.add(frame);

			const screenMat = new THREE.MeshStandardMaterial({
				color: 0x001133, emissive: 0x001144, emissiveIntensity: 0.3,
			});
			const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9), screenMat);
			screen.position.set(data.x, 2, -5.34);
			g.add(screen);

			const light = new THREE.PointLight(0x0044ff, 0.3, 2);
			light.position.set(data.x, 2.5, -5);
			g.add(light);

			// Chart content
			const canvas = document.createElement("canvas");
			canvas.width = 256; canvas.height = 150;
			const ctx = canvas.getContext("2d");

			ctx.fillStyle = "#001133";
			ctx.fillRect(0, 0, 256, 150);

			ctx.strokeStyle = "#003366";
			ctx.lineWidth = 1;
			for (let j = 0; j < 6; j++) {
				ctx.beginPath(); ctx.moveTo(0, j * 30); ctx.lineTo(256, j * 30); ctx.stroke();
			}

			// Chart line
			ctx.strokeStyle = "#00ff88";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(20, 100);
			const vals = [];
			for (let j = 0; j < 10; j++) {
				vals.push(20 + Math.random() * 60);
			}
			vals.sort(() => Math.random() - 0.5);
			vals.forEach((v, j) => {
				ctx.lineTo(20 + j * 24, 130 - v);
			});
			ctx.stroke();

			ctx.fillStyle = "#00aaff";
			ctx.font = "bold 16px Montserrat";
			ctx.textAlign = "center";
			ctx.fillText(data.title, 128, 20);

			// Load values text
			if (data.title === "НАГРУЗКА") {
				ctx.fillStyle = "#22c55e";
				ctx.font = "14px Inter";
				ctx.fillText("ПС-1: 45%  ПС-2: 78%  ПС-3: 23%", 128, 130);
			}

			const tex = new THREE.CanvasTexture(canvas);
			const chartMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
			const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), chartMat);
			chart.position.set(data.x, 2, -5.32);
			g.add(chart);

			this.objects.monitors.push({ frame, screen, chart, light });
			this.objects.monitorCanvasTextures.push(tex);
		});
	}

	createNetworkDiagram() {
		const g = this.group;

		// Background
		const diagramBg = new THREE.Mesh(
			new THREE.PlaneGeometry(4, 2.5),
			new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.7 }),
		);
		diagramBg.position.set(0, 1.2, -5.8);
		g.add(diagramBg);

		// Lines
		const lineMat = new THREE.LineBasicMaterial({ color: 0x22c55e });
		const l1 = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(-1.2, 1.5, -5.75), new THREE.Vector3(-0.2, 1.5, -5.75),
			]),
			lineMat,
		);
		g.add(l1);

		const lineMat2 = new THREE.LineBasicMaterial({ color: 0x22c55e });
		const l2 = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(0.2, 1.5, -5.75), new THREE.Vector3(1.2, 1.5, -5.75),
			]),
			lineMat2,
		);
		g.add(l2);

		this.objects.diagramLines = [
			{ line: l1, material: lineMat },
			{ line: l2, material: lineMat2 },
		];

		// Fault line (task 3)
		const faultMat = new THREE.LineBasicMaterial({ color: 0xef4444 });
		const faultLine = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(-2.5, 1.5, -5.75), new THREE.Vector3(-1.8, 1.5, -5.75),
			]),
			faultMat,
		);
		faultLine.visible = false;
		g.add(faultLine);
		this.objects.faultLine = faultLine;
		this.objects.faultLineMaterial = faultMat;

		// Substation nodes
		const nodes = [
			{ x: -1.5, y: 1.5, color: 0x22c55e },
			{ x: 0, y: 1.5, color: 0xf59e0b },
			{ x: 1.5, y: 1.5, color: 0x22c55e },
		];
		nodes.forEach(n => {
			const node = new THREE.Mesh(
				new THREE.BoxGeometry(0.4, 0.3, 0.05),
				new THREE.MeshStandardMaterial({ color: n.color, emissive: n.color, emissiveIntensity: 0.3 }),
			);
			node.position.set(n.x, n.y, -5.75);
			g.add(node);
		});

		// Label
		const canvas = document.createElement("canvas");
		canvas.width = 256; canvas.height = 32;
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "bold 18px Montserrat";
		ctx.textAlign = "center";
		ctx.fillText("СХЕМА ЭЛЕКТРОСЕТИ", 128, 22);
		const tex = new THREE.CanvasTexture(canvas);
		const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
		label.position.set(0, 2.6, -5.75);
		label.scale.set(2, 0.25, 1);
		g.add(label);
	}

	createSiren() {
		const g = this.group;

		const sirenMat = new THREE.MeshStandardMaterial({
			color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0,
			transparent: true, opacity: 0.5,
		});
		const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16), sirenMat);
		siren.position.set(-6, 3.5, -5.5);
		siren.visible = false;
		g.add(siren);

		const sirenLight = new THREE.PointLight(0xff0000, 0, 10);
		sirenLight.position.copy(siren.position);
		sirenLight.visible = false;
		g.add(sirenLight);

		this.objects.siren = siren;
		this.objects.sirenLight = sirenLight;
		this.objects.sirenMaterial = sirenMat;
	}

	setupCamera() {
		const cam = this.sceneManager.engineerCamera;
		cam.position.set(0, 1.8, 5);
		cam.lookAt(0, 1.5, -5);
	}

	// ── Task methods ──

	startOverloadBlink() {
		const ind = this.objects.overloadIndicator;
		if (!ind) return;
		const interval = setInterval(() => {
			ind.material.emissiveIntensity = ind.material.emissiveIntensity > 0.5 ? 0.3 : 2;
		}, 500);
		this.blinkIntervals.push(interval);
	}

	stopOverloadBlink() {
		const ind = this.objects.overloadIndicator;
		if (ind) {
			ind.material.emissiveIntensity = 0.5;
			ind.material.color.setHex(0x22c55e);
			ind.light.color.setHex(0x22c55e);
		}
	}

	updateSubstationLoad(index, newLoad, newColor) {
		const sub = this.objects.substations[index];
		if (!sub) return;

		// Smooth color transition
		const startColor = sub.material.color.getHex();
		const endR = ((newColor >> 16) & 255) / 255;
		const endG = ((newColor >> 8) & 255) / 255;
		const endB = (newColor & 255) / 255;

		if (sub._loadAnimInterval) clearInterval(sub._loadAnimInterval);
		let progress = 0;
		sub._loadAnimInterval = setInterval(() => {
			progress += 0.05;
			if (progress >= 1) {
				progress = 1;
				clearInterval(sub._loadAnimInterval);
			}
			const r = ((startColor >> 16) & 255) / 255 * (1 - progress) + endR * progress;
			const g2 = ((startColor >> 8) & 255) / 255 * (1 - progress) + endG * progress;
			const b = (startColor & 255) / 255 * (1 - progress) + endB * progress;
			sub.material.color.setRGB(r, g2, b);
		}, 30);

		sub.light.intensity = 1;
		sub.data.load = newLoad;

		// Update label
		const canvas = document.createElement("canvas");
		canvas.width = 256; canvas.height = 64;
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "bold 24px Montserrat";
		ctx.textAlign = "center";
		ctx.fillText(sub.data.name, 128, 24);
		ctx.font = "18px Inter";
		ctx.fillText(`${newLoad}%`, 128, 48);
		sub.label.material.map.dispose();
		const tex = new THREE.CanvasTexture(canvas);
		sub.label.material.map = tex;
		sub.label.material.needsUpdate = true;
	}

	showSiren() {
		const { siren, sirenLight, sirenMaterial } = this.objects;
		siren.visible = true;
		sirenLight.visible = true;
		this._sirenActive = true;
	}

	hideSiren() {
		const { siren, sirenLight, sirenMaterial } = this.objects;
		siren.visible = false;
		sirenLight.visible = false;
		this._sirenActive = false;
		if (sirenMaterial) sirenMaterial.emissiveIntensity = 0;
	}

	showFaultLine() {
		const { faultLine, faultLineMaterial } = this.objects;
		faultLine.visible = true;
		this._faultBlink = true;
	}

	hideFaultLine() {
		const { faultLine, faultLineMaterial } = this.objects;
		faultLine.visible = false;
		this._faultBlink = false;
	}

	updateFaultLineColor(color) {
		const { faultLineMaterial } = this.objects;
		if (faultLineMaterial) {
			faultLineMaterial.color.setHex(color);
			this._faultBlink = false;
		}
	}

	updateLinesColor(lineIndex, color) {
		const line = this.objects.diagramLines[lineIndex];
		if (line) {
			line.material.color.setHex(color);
		}
	}

	// ── Show / Hide ──

	show() {
		this.group.visible = true;
		this.hideSiren();
		this.hideFaultLine();

		if (this.objects.substations) {
			this.objects.substations[0].material.color.setHex(0x22c55e);
			this.objects.substations[0].material.emissiveIntensity = 0.5;
			this.objects.substations[1].material.color.setHex(0xf59e0b);
			this.objects.substations[1].material.emissiveIntensity = 0.7;
			this.objects.substations[2].material.color.setHex(0x22c55e);
			this.objects.substations[2].material.emissiveIntensity = 0.5;
		}

		if (this.objects.diagramLines) {
			this.objects.diagramLines.forEach(l => l.material.color.setHex(0x22c55e));
		}
	}

	hide() {
		this.group.visible = false;
		this.blinkIntervals.forEach(i => clearInterval(i));
		this.blinkIntervals = [];
	}

	update(delta) {
		if (!this.group.visible) return;
		const time = performance.now() / 1000;

		// Siren rotation
		if (this._sirenActive && this.objects.siren) {
			this.objects.siren.rotation.y += delta * 3;
			const intensity = 0.5 + Math.sin(time * 4) * 0.5;
			if (this.objects.sirenMaterial) this.objects.sirenMaterial.emissiveIntensity = intensity;
			if (this.objects.sirenLight) this.objects.sirenLight.intensity = intensity * 2;
		}

		// Fault line blink
		if (this._faultBlink && this.objects.faultLineMaterial) {
			this.objects.faultLineMaterial.color.setHex(
				Math.sin(time * 4) > 0 ? 0xef4444 : 0x880000,
			);
		}

		// Monitor glow
		this.objects.monitors?.forEach((m, i) => {
			if (m.screen) {
				m.screen.material.emissiveIntensity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
			}
		});

		// Ambient pulsing for engineer scene
		const bloomPass = this.sceneManager.bloomPass;
		if (bloomPass && this._sirenActive) {
			bloomPass.strength = 0.4 + Math.sin(time * 3) * 0.2;
		}
	}

	dispose() {
		this.blinkIntervals.forEach(i => clearInterval(i));
	}
}

export default DispatchRoom;
