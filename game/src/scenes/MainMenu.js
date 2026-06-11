// MainMenu.js — 3D-лобби с тремя стендами профессий
import * as THREE from "three";

export class MainMenu {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("menu");

		this.stands = [];
		this.textLabels = [];
		this.lights = [];
		this.clouds = [];
		this.lampPosts = [];
		this.hoveredStand = null;

		this.init();
	}

	init() {
		this.createEnvironment();
		this.createStands();
		this.createTextLabels();
		this.createLampPosts();
		this.createClouds();
		this.setupCamera();
	}

	createEnvironment() {
		const g = this.group;

		// Ground
		const groundGeo = new THREE.PlaneGeometry(40, 40);
		const groundMat = new THREE.MeshStandardMaterial({
			color: 0x2a2a3e,
			roughness: 0.85,
			metalness: 0.1,
		});
		const ground = new THREE.Mesh(groundGeo, groundMat);
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		g.add(ground);

		// Path tiles
		const tileMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.9 });
		for (let i = -3; i <= 3; i++) {
			const tile = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), tileMat);
			tile.rotation.x = -Math.PI / 2;
			tile.position.set(i * 0.7, 0.01, 0);
			g.add(tile);
		}

		// Ambient
		const ambient = new THREE.AmbientLight(0xffffff, 0.5);
		g.add(ambient);

		// Directional
		const dirLight = new THREE.DirectionalLight(0xffe5b4, 1.5);
		dirLight.position.set(5, 15, 10);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 50;
		dirLight.shadow.camera.left = -15;
		dirLight.shadow.camera.right = 15;
		dirLight.shadow.camera.top = 15;
		dirLight.shadow.camera.bottom = -15;
		g.add(dirLight);

		// Hemisphere
		const hemi = new THREE.HemisphereLight(0x87ceeb, 0x444466, 0.4);
		g.add(hemi);
	}

	createStands() {
		const g = this.group;

		const standConfigs = [
			{ id: "foreman", name: "ПРОРАБ", icon: "👷", color: 0xff6b35, pos: [-4, 0, 0], desc: "Мастер СМР" },
			{ id: "engineer", name: "ИНЖЕНЕР-ЭНЕРГЕТИК", icon: "⚡", color: 0x2563eb, pos: [4, 0, 0], desc: "Энергетика" },
			{ id: "inspector", name: "ИНЖЕНЕР КК", icon: "🔬", color: 0x16a34a, pos: [0, 0, -3], desc: "Контроль качества" },
		];

		standConfigs.forEach(cfg => {
			const stand = new THREE.Group();

			// Base
			const base = new THREE.Mesh(
				new THREE.BoxGeometry(2, 0.2, 1),
				new THREE.MeshStandardMaterial({ color: 0x333344 }),
			);
			base.position.y = 0.1;
			base.receiveShadow = true;
			base.castShadow = true;
			stand.add(base);

			// Card
			const cardMat = new THREE.MeshStandardMaterial({
				color: cfg.color,
				roughness: 0.4,
				metalness: 0.2,
				emissive: cfg.color,
				emissiveIntensity: cfg.id === "inspector" ? 0 : 0.15,
			});
			const card = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.15), cardMat);
			card.position.y = 1.55;
			card.castShadow = true;
			card.userData = {
				type: "stand",
				profession: cfg.id,
				material: cardMat,
				locked: cfg.id === "inspector",
				color: cfg.color,
			};
			stand.add(card);

			// Locked overlay (inspector starts locked until both professions done)
			if (cfg.id === "inspector") {
				const lockMat = new THREE.MeshStandardMaterial({
					color: 0x444444,
					roughness: 0.8,
					transparent: true,
					opacity: 0.5,
				});
				const lockMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.02), lockMat);
				lockMesh.position.set(0, 1.55, 0.08);
				lockMesh.userData.isLockOverlay = true;
				stand.add(lockMesh);
				cardMat.emissiveIntensity = 0;
			}

			stand.position.set(...cfg.pos);
			stand.userData = { floatOffset: cfg.id === "engineer" ? Math.PI : 0, config: cfg };
			g.add(stand);

			this.stands.push(stand);

			// Spotlight
			const isDim = cfg.id === "inspector";
			const lightColor = isDim ? 0x444444 : cfg.color;
			const light = new THREE.PointLight(lightColor, isDim ? 0.3 : 1, 6);
			light.position.set(cfg.pos[0], 4, cfg.pos[1]);
			g.add(light);
			this.lights.push(light);
		});
	}

	createTextLabels() {
		const g = this.group;
		const createLabel = (text, bgColor, textColor, pos, scale) => {
			const canvas = document.createElement("canvas");
			canvas.width = 512;
			canvas.height = 128;
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, 512, 128);
			ctx.fillStyle = textColor;
			ctx.font = "bold 44px Montserrat, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, 256, 64);
			const tex = new THREE.CanvasTexture(canvas);
			const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
			const sprite = new THREE.Sprite(mat);
			sprite.position.set(pos[0], pos[1], pos[2]);
			sprite.scale.set(scale || 3, 0.75, 1);
			g.add(sprite);
			return sprite;
		};

		this.textLabels.push(createLabel("ПРОРАБ", "rgba(255,107,53,0.9)", "#FFFFFF", [-4, 4, 0], 3));
		this.textLabels.push(createLabel("👷 Строительство", "rgba(0,0,0,0)", "#94A3B8", [-4, 3.3, 0], 2.5));
		this.textLabels.push(createLabel("ИНЖЕНЕР-ЭНЕРГЕТИК", "rgba(37,99,235,0.9)", "#FFFFFF", [4, 4, 0], 4));
		this.textLabels.push(createLabel("⚡ Энергетика", "rgba(0,0,0,0)", "#94A3B8", [4, 3.3, 0], 2.5));
		this.textLabels.push(createLabel("ИНЖЕНЕР КК", "rgba(22,163,74,0.7)", "#FFFFFF", [0, 4, -3], 3));
		this.textLabels.push(createLabel("🔬 Контроль качества", "rgba(0,0,0,0)", "#94A3B8", [0, 3.3, -3], 2.5));
	}

	createLampPosts() {
		const g = this.group;
		const positions = [[-7, 0, -2], [7, 0, -2], [-7, 0, 2], [7, 0, 2]];

		positions.forEach(pos => {
			const post = new THREE.Group();

			// Pole
			const poleMat = new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.7, metalness: 0.5 });
			const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.5), poleMat);
			pole.position.y = 1.25;
			post.add(pole);

			// Lamp
			const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0.3 });
			const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lampMat);
			lamp.position.y = 2.6;
			post.add(lamp);

			// Light
			const light = new THREE.PointLight(0xffeedd, 0.3, 4);
			light.position.y = 2.6;
			post.add(light);

			post.position.set(pos[0], 0, pos[2]);
			g.add(post);
			this.lampPosts.push(post);
		});
	}

	createClouds() {
		const g = this.group;
		const cloudMat = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.3,
			roughness: 0.9,
		});

		for (let i = 0; i < 6; i++) {
			const cloud = new THREE.Group();
			const numBlobs = 3 + Math.floor(Math.random() * 3);
			for (let j = 0; j < numBlobs; j++) {
				const blob = new THREE.Mesh(
					new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 6),
					cloudMat,
				);
				blob.position.set((j - numBlobs / 2) * 0.4, Math.random() * 0.2, 0);
				blob.scale.y = 0.5;
				cloud.add(blob);
			}
			cloud.position.set(
				(Math.random() - 0.5) * 20,
				5 + Math.random() * 2,
				-5 - Math.random() * 5,
			);
			cloud.userData.speed = 0.2 + Math.random() * 0.3;
			g.add(cloud);
			this.clouds.push(cloud);
		}
	}

	setupCamera() {
		const cam = this.sceneManager.menuCamera;
		cam.position.set(0, 8, 14);
		cam.lookAt(0, 0, 0);
	}

	onMouseMove(mouse) {
		const raycaster = this.sceneManager.raycaster;
		const camera = this.sceneManager.menuCamera;

		raycaster.setFromCamera(mouse, camera);

		// Collect stand meshes
		const cards = [];
		this.stands.forEach(stand => {
			stand.traverse(child => {
				if (child.isMesh && child.userData.type === "stand") cards.push(child);
			});
		});

		const intersects = raycaster.intersectObjects(cards);

		// Reset previous hover
		if (this.hoveredStand && !intersects.some(i => i.object === this.hoveredStand)) {
			const mat = this.hoveredStand.userData.material;
			if (mat) mat.emissiveIntensity = this.hoveredStand.userData.locked ? 0 : 0.15;
			this.hoveredStand.scale.set(1, 1, 1);
			document.body.style.cursor = "default";
			this.hoveredStand = null;
		}

		if (intersects.length > 0) {
			const card = intersects[0].object;
			if (card === this.hoveredStand) return;
			this.hoveredStand = card;
			document.body.style.cursor = card.userData.locked ? "not-allowed" : "pointer";
			const mat = card.userData.material;
			if (mat) mat.emissiveIntensity = 0.4;
			card.scale.set(1.08, 1.08, 1.08);
		}
	}

	onClick(mouse) {
		const raycaster = this.sceneManager.raycaster;
		const camera = this.sceneManager.menuCamera;
		raycaster.setFromCamera(mouse, camera);

		const cards = [];
		this.stands.forEach(stand => {
			stand.traverse(child => {
				if (child.isMesh && child.userData.type === "stand") cards.push(child);
			});
		});

		const intersects = raycaster.intersectObjects(cards);
		if (intersects.length > 0) {
			const card = intersects[0].object;
			const prof = card.userData.profession;
			if (card.userData.locked) {
				// Shake animation
				const stand = this.stands[2];
				// This is handled by the game
				return "locked";
			}
			return prof;
		}
		return null;
	}

	// Unlock inspector stand (called when both professions completed)
	unlockInspector() {
		const card = this.getStandCard("inspector");
		if (!card) return;

		card.userData.locked = false;
		const mat = card.userData.material;
		if (mat) {
			mat.color.setHex(0x16a34a);
			mat.emissive.setHex(0x16a34a);
			mat.emissiveIntensity = 0.15;
		}

		// Hide lock overlay
		this.stands.forEach(s => {
			s.traverse(child => {
				if (child.isMesh && child.userData.isLockOverlay) child.visible = false;
			});
		});

		// Light up
		const light = this.lights[2];
		if (light) { light.color.setHex(0x16a34a); light.intensity = 1.5; }
		return true;
	}

	getStandCard(profession) {
		for (const stand of this.stands) {
			let found = null;
			stand.traverse(child => {
				if (child.isMesh && child.userData.type === "stand" && child.userData.profession === profession)
					found = child;
			});
			if (found) return found;
		}
		return null;
	}

	show() { this.group.visible = true; }
	hide() { this.group.visible = false; }

	update(delta) {
		if (!this.group.visible) return;
		const time = performance.now() / 1000;

		// Float stands
		this.stands.forEach((stand, i) => {
			const offset = stand.userData.floatOffset || 0;
			stand.position.y = Math.sin(time * 1.5 + offset) * 0.1;
		});

		// Move clouds
		this.clouds.forEach(cloud => {
			cloud.position.x += cloud.userData.speed * delta;
			if (cloud.position.x > 15) cloud.position.x = -15;
		});

		// Pulse lamp lights
		this.lampPosts.forEach((post, i) => {
			const light = post.children.find(c => c.isPointLight);
			if (light) {
				light.intensity = 0.2 + Math.sin(time * 1.5 + i) * 0.1;
			}
		});
	}

	dispose() {
		this.group.traverse(child => {
			if (child.geometry) child.geometry.dispose();
			if (child.material) {
				if (child.material.map) child.material.map.dispose();
				child.material.dispose();
			}
		});
	}
}

export default MainMenu;
