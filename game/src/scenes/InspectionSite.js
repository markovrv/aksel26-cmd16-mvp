// InspectionSite.js — Сцена стройплощадки для Инженера КК (осмотр стен)
import * as THREE from "three";

export class InspectionSite {
	constructor(sceneManager) {
		this.sm = sceneManager;
		this.group = sceneManager.createGroup("inspector");

		this.objects = {};
		this.clickableObjects = [];
		this.defectMeshes = [];

		this.init();
	}

	init() {
		this.createRoom();
		this.createColumns();
		this.createMainWall();
		this.createTools();
		this.createLighting();
		this.createWorker();
		this.setupCamera();
	}

	createRoom() {
		const g = this.group;

		// Floor
		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }),
		);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		g.add(floor);

		// Grid
		const grid = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
		grid.position.y = 0.01;
		grid.material.transparent = true;
		grid.material.opacity = 0.4;
		g.add(grid);

		// Back wall
		const wallMat = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.8 });
		const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMat);
		back.position.set(0, 2, -5);
		g.add(back);

		// Side walls
		const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMat);
		sideWall.position.set(-5, 2, 0);
		sideWall.rotation.y = Math.PI / 2;
		g.add(sideWall);

		const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMat);
		sideWall2.position.set(5, 2, 0);
		sideWall2.rotation.y = -Math.PI / 2;
		g.add(sideWall2);

		// Ceiling
		const ceiling = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }),
		);
		ceiling.rotation.x = Math.PI / 2;
		ceiling.position.y = 4;
		g.add(ceiling);

		// Window opening (hole in back wall visual — just a lighter rectangle)
		const windowMat = new THREE.MeshStandardMaterial({
			color: 0x87ceeb,
			emissive: 0x87ceeb,
			emissiveIntensity: 0.5,
			transparent: true,
			opacity: 0.6,
		});
		const window = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), windowMat);
		window.position.set(3, 2.5, -4.98);
		g.add(window);
	}

	createColumns() {
		const g = this.group;
		const colMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.8 });

		const positions = [[-3, 0, -2], [3, 0, -2], [-3, 0, 2], [3, 0, 2]];
		positions.forEach(pos => {
			const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 12), colMat);
			col.position.set(pos[0], 1.5, pos[1]);
			col.castShadow = true;
			g.add(col);
		});
	}

	createMainWall() {
		const g = this.group;

		// Main wall — Section A (task 1)
		const brickMat = new THREE.MeshStandardMaterial({
			color: 0xcc8844,
			roughness: 0.8,
		});
		const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.3), brickMat);
		wall.position.set(0, 1.5, -4);
		wall.castShadow = true;
		g.add(wall);
		this.objects.mainWall = wall;
		this.clickableObjects.push(wall);

		// Section B (decorative)
		const wallB = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.3), brickMat);
		wallB.position.set(-4, 1.5, 0);
		wallB.rotation.y = Math.PI / 2;
		wallB.castShadow = true;
		g.add(wallB);

		// 9 clickable zones on the wall (3x3 grid, invisible planes)
		this.objects.zones = [];
		this.objects.zoneDefects = []; // track defect status per zone
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const zone = new THREE.Mesh(
					new THREE.PlaneGeometry(1.2, 0.9),
					new THREE.MeshBasicMaterial({
						color: 0x00ff00,
						transparent: true,
						opacity: 0,
						side: THREE.DoubleSide,
					}),
				);
				const zx = (col - 1) * 1.3;
				const zy = 1.5 + (1 - row) * 0.9;
				zone.position.set(zx, zy, -3.84);
				zone.userData = { zoneRow: row, zoneCol: col, hasDefect: false, defectFound: false };
				g.add(zone);
				this.objects.zones.push(zone);
				this.clickableObjects.push(zone);
				this.objects.zoneDefects.push(false);
			}
		}

		// Defect 1: Crack (red line segments) — zone [1,2]
		const crackPoints = [
			new THREE.Vector3(-0.1, 2.0, -3.82),
			new THREE.Vector3(0.1, 1.9, -3.82),
			new THREE.Vector3(0.05, 1.7, -3.82),
			new THREE.Vector3(0.2, 1.5, -3.82),
		];
		const crackGeo = new THREE.BufferGeometry().setFromPoints(crackPoints);
		const crackMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
		const crack = new THREE.Line(crackGeo, crackMat);
		crack.visible = false;
		crack.userData = { defectId: "crack", zoneIdx: 4 }; // [1,2] → row 1, col 2 → index 1*3+2=5? wait [1][2] = 1*3+2 = 5
		g.add(crack);

		// Defect 2: Gap (thin white plane) — zone [2,0]
		const gapMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.7,
		});
		const gap = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.05), gapMat);
		gap.position.set(-1.2, 0.6, -3.82);
		gap.visible = false;
		gap.userData = { defectId: "gap", zoneIdx: 6 }; // [2,0] = 2*3+0 = 6
		g.add(gap);

		// Defect 3: Bulge (small sphere) — zone [0,1]
		const bulgeMat = new THREE.MeshStandardMaterial({
			color: 0xcc6644,
			roughness: 0.9,
			transparent: true,
			opacity: 0,
		});
		const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), bulgeMat);
		bulge.position.set(0, 2.7, -3.82);
		bulge.visible = false;
		bulge.userData = { defectId: "bulge", zoneIdx: 1 }; // [0,1] = 0*3+1 = 1
		g.add(bulge);

		this.defectMeshes = [crack, gap, bulge];

		// Setup zone defect mapping
		// defect_crack → zone [1,2] = index 5
		// defect_gap → zone [2,0] = index 6
		// defect_bulge → zone [0,1] = index 1
		this.objects.zones[5].userData.hasDefect = true;
		this.objects.zones[5].userData.defectMesh = crack;
		this.objects.zones[5].userData.defectName = "Трещина в кладке";
		this.objects.zones[6].userData.hasDefect = true;
		this.objects.zones[6].userData.defectMesh = gap;
		this.objects.zones[6].userData.defectName = "Широкий шов >12 мм";
		this.objects.zones[1].userData.hasDefect = true;
		this.objects.zones[1].userData.defectMesh = bulge;
		this.objects.zones[1].userData.defectName = "Вздутие кирпича";

		// Tape across wall (after task 1 completion)
		const tapeMat = new THREE.MeshBasicMaterial({
			color: 0xef4444,
			transparent: true,
			opacity: 0.3,
		});
		const tape = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.15), tapeMat);
		tape.position.set(0, 1.5, -3.82);
		tape.visible = false;
		g.add(tape);
		this.objects.tape = tape;
	}

	createTools() {
		const g = this.group;

		// Tablet
		const tabletMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
		const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.02), tabletMat);
		tablet.position.set(-1, 0.05, 2);
		tablet.rotation.x = -0.3;
		g.add(tablet);

		// Screen glow on tablet
		const screenMat = new THREE.MeshStandardMaterial({
			color: 0x0044ff,
			emissive: 0x0044ff,
			emissiveIntensity: 0.2,
		});
		const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.32), screenMat);
		screen.position.set(-1, 0.06, 2.02);
		screen.rotation.x = -0.3;
		g.add(screen);

		// Tape measure
		const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.5 });
		const tapeRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12), tapeMat);
		tapeRoll.position.set(-0.3, 0.05, 2);
		tapeRoll.rotation.x = Math.PI / 2;
		g.add(tapeRoll);

		// Level
		const levelMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
		const level = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), levelMat);
		level.position.set(0.5, 0.05, 2);
		g.add(level);

		// Phone on wall (for task 3)
		const phoneMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
		const phone = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.05), phoneMat);
		phone.position.set(2.5, 2.5, -4.85);
		g.add(phone);

		// Phone light
		const phoneLight = new THREE.MeshStandardMaterial({
			color: 0xf59e0b,
			emissive: 0xf59e0b,
			emissiveIntensity: 0,
		});
		const phoneLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), phoneLight);
		phoneLed.position.set(2.5, 2.35, -4.83);
		g.add(phoneLed);
		this.objects.phoneLed = phoneLed;
		this.objects.phoneLightMat = phoneLight;

		// Hanging lamp
		const lampMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffeedd, emissiveIntensity: 0.3 });
		const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lampMat);
		lamp.position.set(0, 3.8, -1);
		g.add(lamp);

		const wireMat = new THREE.LineBasicMaterial({ color: 0x333333 });
		const wireGeo = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 4, -1), new THREE.Vector3(0, 3.8, -1),
		]);
		const wire = new THREE.Line(wireGeo, wireMat);
		g.add(wire);

		const pointLight = new THREE.PointLight(0xffeedd, 0.8, 5);
		pointLight.position.set(0, 3.7, -1);
		g.add(pointLight);
	}

	createLighting() {
		const g = this.group;

		const ambient = new THREE.AmbientLight(0xffffff, 0.5);
		g.add(ambient);

		// Light from window
		const dirLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
		dirLight.position.set(3, 5, -3);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		g.add(dirLight);
	}

	createWorker() {
		const g = this.group;
		const worker = new THREE.Group();
		const bodyMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
		const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), bodyMat);
		body.position.y = 0.5;
		worker.add(body);
		const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12),
			new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
		head.position.y = 0.85;
		worker.add(head);
		const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.1, 12),
			new THREE.MeshStandardMaterial({ color: 0xffdd00, metalness: 0.3 }));
		helmet.position.y = 1.0;
		worker.add(helmet);
		worker.position.set(-3, 0, 2);
		worker.rotation.y = -0.5;
		worker.userData.isWorker = true;
		g.add(worker);
		this.objects.inspectorWorker = worker;
	}

	setupCamera() {
		const cam = this.sm.inspectorCamera;
		if (!cam) {
			// Camera created in SceneManager switchScene
		}
	}

	// ── Task animations ──

	showDefect(zoneIdx) {
		const zone = this.objects.zones[zoneIdx];
		if (!zone || zone.userData.defectFound) return false;
		zone.userData.defectFound = true;

		const mesh = zone.userData.defectMesh;
		if (mesh) {
			mesh.visible = true;
			if (mesh.material) {
				mesh.material.transparent = true;
				mesh.material.opacity = 1;
			}
		}

		// Red marker on zone
		const marker = new THREE.Mesh(
			new THREE.SphereGeometry(0.08, 8, 8),
			new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 }),
		);
		marker.position.copy(zone.position);
		marker.position.z = -3.82;
		this.group.add(marker);

		return true;
	}

	showTape() {
		if (this.objects.tape) this.objects.tape.visible = true;
	}

	startPhoneBlink() {
		this._phoneBlink = true;
		if (this.objects.phoneLightMat) {
			this.objects.phoneLightMat.emissiveIntensity = 1;
		}
	}

	stopPhoneBlink() {
		this._phoneBlink = false;
		if (this.objects.phoneLightMat) {
			this.objects.phoneLightMat.emissiveIntensity = 0;
		}
	}

	// ── Show / Hide ──

	show() {
		this.group.visible = true;
		this.objects.tape.visible = false;
		this.objects.zones.forEach(z => { z.userData.defectFound = false; });
		this.defectMeshes.forEach(m => m.visible = false);
		this.stopPhoneBlink();
	}

	hide() {
		this.group.visible = false;
	}

	update(delta) {
		if (!this.group.visible) return;
		const time = performance.now() / 1000;

		// Phone blink
		if (this._phoneBlink && this.objects.phoneLightMat) {
			this.objects.phoneLightMat.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.5;
		}

		// Worker idle
		if (this.objects.inspectorWorker) {
			this.objects.inspectorWorker.position.y = Math.sin(time * 1.5) * 0.02;
		}
	}
}

export default InspectionSite;
