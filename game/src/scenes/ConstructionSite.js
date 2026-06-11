// ConstructionSite.js — Строительная площадка (Профессия: Прораб)
import * as THREE from "three";

export class ConstructionSite {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("foreman");

		this.objects = {};
		this.workers = [];
		this.clickableObjects = [];

		this.init();
	}

	init() {
		this.createEnvironment();
		this.createFoundation();
		this.createWalls();
		this.createTruck();
		this.createWarehouse();
		this.createWorkers();
		this.createZones();
		this.createExtraObjects();
		this.setupCamera();
	}

	createEnvironment() {
		const g = this.group;
		const groundGeo = new THREE.PlaneGeometry(40, 40);
		const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a5a4a, roughness: 0.9 });
		const ground = new THREE.Mesh(groundGeo, groundMat);
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		g.add(ground);
		this.objects.ground = ground;

		// Lights
		const ambient = new THREE.AmbientLight(0xffffff, 0.8);
		g.add(ambient);

		const sun = new THREE.DirectionalLight(0xffe5b4, 1.2);
		sun.position.set(10, 20, 10);
		sun.castShadow = true;
		sun.shadow.mapSize.width = 2048;
		sun.shadow.mapSize.height = 2048;
		sun.shadow.camera.near = 1;
		sun.shadow.camera.far = 50;
		sun.shadow.camera.left = -20;
		sun.shadow.camera.right = 20;
		sun.shadow.camera.top = 20;
		sun.shadow.camera.bottom = -20;
		g.add(sun);
		this.objects.sun = sun;

		const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b6914, 0.6);
		g.add(hemi);
	}

	createFoundation() {
		const g = this.group;
		const geo = new THREE.BoxGeometry(6, 0.3, 4);
		const mat = new THREE.MeshStandardMaterial({
			color: 0x888888,
			roughness: 0.9,
		});
		const foundation = new THREE.Mesh(geo, mat);
		foundation.position.set(0, 0.15, 0);
		foundation.castShadow = true;
		foundation.receiveShadow = true;
		g.add(foundation);
		this.objects.foundation = foundation;
	}

	createWalls() {
		const g = this.group;
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0xcc6644,
			roughness: 0.7,
		});

		const positions = [
			{ x: 0, y: 1, z: -1.9, rotY: 0 },
			{ x: -2.9, y: 1, z: -1, rotY: Math.PI / 2 },
			{ x: 2.9, y: 1, z: -1, rotY: Math.PI / 2 },
		];

		this.objects.walls = [];
		positions.forEach(pos => {
			const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.25), wallMat.clone());
			wall.position.set(pos.x, 0, pos.z);
			wall.rotation.y = pos.rotY;
			wall.castShadow = true;
			wall.receiveShadow = true;
			wall.scale.y = 0;
			wall.visible = false;
			g.add(wall);
			this.objects.walls.push(wall);
		});
	}

	createTruck() {
		const g = this.group;
		const truck = new THREE.Group();

		const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5, metalness: 0.3 });

		// Body (вытянут по Z, грузовик едет вдоль Z)
		const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 2), bodyMat);
		body.position.set(0, 0.5, 0);
		body.castShadow = true;
		truck.add(body);

		// Cab (спереди по +Z)
		const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 1), bodyMat);
		cab.position.set(0, 0.6, 1.2);
		cab.castShadow = true;
		truck.add(cab);

		// Wheels (вдоль Z, по бокам X)
		const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
		const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
		const wPositions = [
			{ x: -0.5, z: -0.6 }, { x: 0.5, z: -0.6 },
			{ x: -0.5, z: 0.8 }, { x: 0.5, z: 0.8 },
		];
		wPositions.forEach(pos => {
			const wheel = new THREE.Mesh(wheelGeo, wheelMat);
			wheel.rotation.z = Math.PI / 2;
			wheel.position.set(pos.x, 0.3, pos.z);
			wheel.castShadow = true;
			truck.add(wheel);
		});

		// Headlights (спереди по +Z)
		const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0 });
		const hlGeo = new THREE.SphereGeometry(0.1, 8, 8);
		const leftHL = new THREE.Mesh(hlGeo, hlMat.clone());
		leftHL.position.set(-0.3, 0.4, 1.6);
		truck.add(leftHL);
		const rightHL = new THREE.Mesh(hlGeo, hlMat.clone());
		rightHL.position.set(0.3, 0.4, 1.6);
		truck.add(rightHL);

		truck.position.set(-6, 0, -20);
		truck.rotation.y = 0;
		g.add(truck);

		this.objects.truck = truck;
		this.objects.truckLights = [leftHL, rightHL];
		this.clickableObjects.push(truck);

		// Alert sphere
		const alertMat = new THREE.MeshStandardMaterial({
			color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5,
			transparent: true, opacity: 0.8,
		});
		const alert = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), alertMat);
		alert.position.set(-6, 1.5, -3);
		alert.visible = false;
		g.add(alert);
		this.objects.truckAlert = alert;
	}

	createWarehouse() {
		const g = this.group;
		const mat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });

		const warehouse = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), mat);
		warehouse.position.set(5, 1, -2);
		warehouse.castShadow = true;
		warehouse.receiveShadow = true;
		g.add(warehouse);

		// Roof
		const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1, 4), mat);
		roof.position.set(5, 2.5, -2);
		roof.rotation.y = Math.PI / 4;
		roof.castShadow = true;
		g.add(roof);

		this.objects.warehouse = warehouse;
		this.clickableObjects.push(warehouse);
	}

	createWorkers() {
		const g = this.group;
		const workerData = [
			{ name: "Пётр", color: 0x3366cc, role: "каменщик" },
			{ name: "Василий", color: 0x33aa55, role: "подсобник" },
			{ name: "Николай", color: 0x3366cc, role: "каменщик" },
			{ name: "Ольга", color: 0x8844aa, role: "сварщик" },
			{ name: "Евгений", color: 0xcc6633, role: "водитель" },
		];

		this.workers = [];
		const startX = -4;
		const spacing = 1.2;

		workerData.forEach((data, i) => {
			const worker = new THREE.Group();
			const bodyMat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.7 });
			const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.4, 4, 8), bodyMat);
			body.position.y = 0.65;
			body.castShadow = true;
			worker.add(body);

			const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.8 });
			const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), headMat);
			head.position.y = 1.1;
			head.castShadow = true;
			worker.add(head);

			const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.5, metalness: 0.3 });
			const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 16), helmetMat);
			helmet.position.y = 1.3;
			helmet.castShadow = true;
			worker.add(helmet);

			worker.userData = {
				name: data.name, role: data.role, color: data.color,
				originalPos: { x: startX + i * spacing, y: 0, z: 3 },
			};
			worker.position.set(startX + i * spacing, 0, 3);
			g.add(worker);
			this.workers.push(worker);
		});
	}

	createZones() {
		const g = this.group;

		// Foundation zone marker
		const fZone = new THREE.Mesh(
			new THREE.PlaneGeometry(3, 2),
			new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.5 }),
		);
		fZone.rotation.x = -Math.PI / 2;
		fZone.position.set(-2, 0.02, 2);
		fZone.visible = false;
		g.add(fZone);

		// Walls zone marker
		const wZone = new THREE.Mesh(
			new THREE.PlaneGeometry(4, 3),
			new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.5 }),
		);
		wZone.rotation.x = -Math.PI / 2;
		wZone.position.set(2, 0.02, 2);
		wZone.visible = false;
		g.add(wZone);

		this.objects.foundationZone = fZone;
		this.objects.wallsZone = wZone;
	}

	createExtraObjects() {
		const g = this.group;

		// Anchor bolts (for task 3)
		const boltMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.3 });
		this.objects.anchorBolts = [];
		for (let i = 0; i < 5; i++) {
			const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), boltMat.clone());
			bolt.position.set(2 + (i - 2) * 0.3, 0.1, 3);
			bolt.visible = false;
			g.add(bolt);
			this.objects.anchorBolts.push(bolt);
		}

		// Red emergency light (for task 3)
		const emMat = new THREE.MeshStandardMaterial({
			color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0,
			transparent: true, opacity: 0.5,
		});
		const emLight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), emMat);
		emLight.position.set(2, 1.5, 3);
		emLight.visible = false;
		g.add(emLight);

		const emPointLight = new THREE.PointLight(0xff0000, 0, 5);
		emPointLight.position.set(2, 1.5, 3);
		emPointLight.visible = false;
		g.add(emPointLight);

		this.objects.emergencyLight = emLight;
		this.objects.emergencyPointLight = emPointLight;
		this.objects.emergencyMat = emMat;
	}

	setupCamera() {
		const cam = this.sceneManager.foremanCamera;
		cam.position.set(10, 8, 10);
		cam.lookAt(0, 1, 0);
	}

	// ── Animation helpers ──

	animateTruckArrival() {
		const { truck, truckLights, truckAlert } = this.objects;
		truck.position.z = -20;
		truck.visible = true;
		truckAlert.visible = true;
		this._truckArriveAnim = true;
	}

	animateTruckDeparture() {
		const { truck, truckAlert } = this.objects;
		truckAlert.visible = false;
		this._truckDepartAnim = true;
	}

	showWalls() {
		this.objects.walls.forEach((wall, i) => {
			wall.visible = true;
			this._wallGrowAnim = true;
		});
	}

	moveWorkersToZones(assignments) {
		const zones = { foundation: { x: -2, z: 0 }, walls: { x: 2, z: 0 } };
		this.workers.forEach((worker, i) => {
			let targetZone = null;
			if (assignments.foundation.includes(i)) targetZone = "foundation";
			else if (assignments.walls.includes(i)) targetZone = "walls";
			if (targetZone) {
				const zonePos = zones[targetZone];
				const offsetX = (assignments[targetZone].indexOf(i) - (assignments[targetZone].length - 1) / 2) * 0.8;
				worker.userData.targetPos = { x: zonePos.x + offsetX, z: zonePos.z };
			}
		});
		this._workerMoveAnim = true;
		this._workerMoveAssignments = assignments;
	}

	animateWorkersScatter() {
		this.workers.forEach((worker, i) => {
			const angle = (i / this.workers.length) * Math.PI * 2;
			const dist = 6 + Math.random() * 3;
			worker.userData._animating = true;
			worker.userData._animPhase = "scatter";
			worker.userData._scatterTarget = {
				x: worker.position.x + Math.cos(angle) * dist,
				z: worker.position.z + Math.sin(angle) * dist,
			};
		});
	}

	showAnchorBolts() {
		this.objects.anchorBolts.forEach((bolt, i) => {
			setTimeout(() => { bolt.visible = true; }, i * 200);
		});
	}

	startEmergency() {
		const { emergencyLight, emergencyPointLight, emergencyMat } = this.objects;
		emergencyLight.visible = true;
		emergencyPointLight.visible = true;
		this._emergencyActive = true;
	}

	stopEmergency() {
		const { emergencyLight, emergencyPointLight, emergencyMat } = this.objects;
		emergencyLight.visible = false;
		emergencyPointLight.visible = false;
		this._emergencyActive = false;
		if (emergencyMat) emergencyMat.emissiveIntensity = 0;
	}

	animateVasiliyToWarehouse() {
		const vasiliy = this.workers[1];
		if (!vasiliy) return;
		vasiliy.userData._animating = true;
		vasiliy.userData._animPhase = "to_warehouse";
		vasiliy.userData._animStartPos = { x: vasiliy.position.x, z: vasiliy.position.z };
		vasiliy.userData._animStartTime = performance.now();
		return new Promise(resolve => {
			vasiliy.userData._animResolve = resolve;
		});
	}

	// ── Show / Hide ──

	show() {
		this.group.visible = true;
		// Reset state
		this.objects.walls.forEach(w => { w.scale.y = 0; w.visible = false; });
		this.objects.truck.position.z = -20;
		this.objects.truckAlert.visible = false;
		this.objects.foundationZone.visible = false;
		this.objects.wallsZone.visible = false;
		this.objects.anchorBolts.forEach(b => b.visible = false);
		this.stopEmergency();
		this.workers.forEach(w => {
			w.position.set(w.userData.originalPos.x, w.userData.originalPos.y, w.userData.originalPos.z);
			w.userData._animating = false;
		});
		this._truckArriveAnim = false;
		this._truckDepartAnim = false;
		this._wallGrowAnim = false;
		this._workerMoveAnim = false;
		this._emergencyActive = false;
	}

	hide() {
		this.group.visible = false;
	}

	update(delta) {
		if (!this.group.visible) return;
		const time = performance.now() / 1000;

		// Worker breathing
		this.workers.forEach((w, i) => {
			if (!w.userData._animating) {
				const body = w.children[0];
				if (body) body.scale.y = 1 + Math.sin(time * 3 + i) * 0.01;
			}
		});

		// Truck arrival animation
		if (this._truckArriveAnim) {
			const truck = this.objects.truck;
			if (truck.position.z < -3) {
				truck.position.z += delta * 8;
				if (truck.position.z >= -3) {
					truck.position.z = -3;
					this._truckArriveAnim = false;
					// Headlights on
					this.objects.truckLights.forEach(l => { l.material.emissiveIntensity = 0.5; });
				}
			}
		}

		// Truck departure
		if (this._truckDepartAnim) {
			const truck = this.objects.truck;
			truck.position.z -= delta * 8;
			if (truck.position.z < -20) {
				truck.position.z = -20;
				truck.visible = false;
				this._truckDepartAnim = false;
			}
		}

		// Truck alert pulse
		if (this.objects.truckAlert?.visible) {
			this.objects.truckAlert.scale.setScalar(1 + Math.sin(time * 4) * 0.3);
		}

		// Wall growth
		if (this._wallGrowAnim) {
			let allDone = true;
			this.objects.walls.forEach(w => {
				if (w.scale.y < 1) {
					allDone = false;
					w.scale.y = Math.min(1, w.scale.y + delta * 1.5);
				}
			});
			if (allDone) this._wallGrowAnim = false;
		}

		// Worker movement
		if (this._workerMoveAnim) {
			let allDone = true;
			this.workers.forEach((w, i) => {
				const target = w.userData.targetPos;
				if (target) {
					const dx = target.x - w.position.x;
					const dz = target.z - w.position.z;
					if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
						allDone = false;
						w.position.x += dx * delta * 2;
						w.position.z += dz * delta * 2;
					} else {
						w.position.x = target.x;
						w.position.z = target.z;
					}
				}
			});
			if (allDone) {
				this._workerMoveAnim = false;
				this.objects.foundationZone.visible = true;
				this.objects.wallsZone.visible = true;
				this.showWalls();
			}
		}

		// Emergency light pulse
		if (this._emergencyActive) {
			const intensity = 0.5 + Math.sin(time * 6) * 0.5;
			if (this.objects.emergencyMat) this.objects.emergencyMat.emissiveIntensity = intensity;
			if (this.objects.emergencyPointLight) this.objects.emergencyPointLight.intensity = intensity * 2;
		}

		// Vasiliy animation
		this.workers.forEach(w => {
			if (w.userData._animating) {
				const phase = w.userData._animPhase;
				const elapsed = (performance.now() - w.userData._animStartTime) / 1000;
				if (phase === "to_warehouse") {
					const progress = Math.min(elapsed / 2, 1);
					w.position.x = -4 + progress * 9; // -4 to 5
					w.position.z = 3 - progress * 5;  // 3 to -2
					if (progress >= 1) {
						w.userData._animPhase = "to_walls";
						w.userData._animStartTime = performance.now();
					}
				} else if (phase === "scatter") {
					const target = w.userData._scatterTarget;
					if (target) {
						const dx = target.x - w.position.x;
						const dz = target.z - w.position.z;
						if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
							w.position.x += dx * delta * 1.5;
							w.position.z += dz * delta * 1.5;
						} else {
							w.userData._animating = false;
						}
					}
				} else if (phase === "to_walls") {
					const progress = Math.min(elapsed / 1.5, 1);
					w.position.x = 5 - progress * 3;  // 5 to 2
					w.position.z = -2 + progress * 3; // -2 to 1
					if (progress >= 1) {
						w.userData._animating = false;
						this.showAnchorBolts();
						if (w.userData._animResolve) {
							w.userData._animResolve();
							w.userData._animResolve = null;
						}
					}
				}
			}
		});

		// Truck alert visible check
		if (this.objects.truckAlert?.visible) {
			this.objects.truckAlert.rotation.y += delta * 2;
		}
	}
}

export default ConstructionSite;
