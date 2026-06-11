// SceneManager.js — Управление Three.js сценой, камерами, рендерером, пост-эффектами
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export class SceneManager {
	constructor(canvas) {
		this.canvas = canvas;
		this.scene = new THREE.Scene();

		// Cameras
		this.menuCamera = null;
		this.foremanCamera = null;
		this.engineerCamera = null;
		this.inspectorCamera = null;
		this.activeCamera = null;

		// Groups for each scene (toggled by visibility)
		this.groups = {};

		this.controls = null;
		this.composer = null;
		this.bloomPass = null;
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.clock = new THREE.Clock();

		this.currentSceneName = "none";

		this.initRenderer();
		this.initCameras();
		this.initComposer();
		this.initControls();

		window.addEventListener("resize", () => this.onResize());
	}

	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.2;
	}

	initCameras() {
		this.menuCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
		this.menuCamera.position.set(0, 8, 14);
		this.menuCamera.lookAt(0, 0, 0);

		this.foremanCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
		this.foremanCamera.position.set(10, 8, 10);
		this.foremanCamera.lookAt(0, 1, 0);

		this.engineerCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
		this.engineerCamera.position.set(0, 1.8, 5);
		this.engineerCamera.lookAt(0, 1.5, -5);

		this.inspectorCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
		this.inspectorCamera.position.set(0, 1.7, 3);
		this.inspectorCamera.lookAt(0, 1.7, -4);

		this.activeCamera = this.menuCamera;
	}

	initComposer() {
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(this.scene, this.activeCamera));

		this.bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.4, 0.3, 0.85
		);
		this.composer.addPass(this.bloomPass);
	}

	initControls() {
		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.minDistance = 5;
		this.controls.maxDistance = 25;
		this.controls.minPolarAngle = THREE.MathUtils.degToRad(10);
		this.controls.maxPolarAngle = THREE.MathUtils.degToRad(60);
		this.controls.target.set(0, 1, 0);
		this.controls.enabled = false;
	}

	// Create a group for a scene
	createGroup(name) {
		if (!this.groups[name]) {
			const group = new THREE.Group();
			group.visible = false;
			this.scene.add(group);
			this.groups[name] = group;
		}
		return this.groups[name];
	}

	// Get group
	getGroup(name) {
		return this.groups[name];
	}

	// Switch active scene
	switchScene(name) {
		// Hide all groups
		Object.values(this.groups).forEach(g => { g.visible = false; });

		// Show target group
		if (this.groups[name]) {
			this.groups[name].visible = true;
		}

		this.currentSceneName = name;

		// Setup camera and controls per scene
		switch (name) {
			case "menu":
				this.activeCamera = this.menuCamera;
				this.controls.enabled = false;
				this.setBloom(0);
				break;
			case "foreman":
				this.activeCamera = this.foremanCamera;
				this.controls.enabled = true;
				this.controls.target.set(0, 1, 0);
				this.controls.minPolarAngle = THREE.MathUtils.degToRad(10);
				this.controls.maxPolarAngle = THREE.MathUtils.degToRad(60);
				this.setBloom(0);
				break;
			case "engineer":
				this.activeCamera = this.engineerCamera;
				this.controls.enabled = false;
				this.setBloom(0.4);
				break;
			case "inspector":
				this.activeCamera = this.inspectorCamera;
				this.controls.enabled = true;
				this.controls.target.set(0, 1.7, -4);
				this.controls.minPolarAngle = THREE.MathUtils.degToRad(20);
				this.controls.maxPolarAngle = THREE.MathUtils.degToRad(70);
				this.controls.minDistance = 1;
				this.controls.maxDistance = 8;
				this.controls.enablePan = false;
				this.setBloom(0);
				break;
			default:
				this.activeCamera = this.menuCamera;
				this.controls.enabled = false;
				this.setBloom(0);
		}

		// Update composer render pass
		this.composer.passes[0] = new RenderPass(this.scene, this.activeCamera);
	}

	// Set bloom strength
	setBloom(strength) {
		if (this.bloomPass) {
			this.bloomPass.strength = strength;
		}
	}

	// Parallax camera effect for engineer scene
	updateParallax(clientX, clientY) {
		if (this.currentSceneName !== "engineer") return;
		const x = (clientX / window.innerWidth) * 2 - 1;
		const y = -(clientY / window.innerHeight) * 2 + 1;
		const targetX = x * 0.3;
		const targetY = 1.8 + y * 0.1;
		this.engineerCamera.position.x += (targetX - this.engineerCamera.position.x) * 0.05;
		this.engineerCamera.position.y += (targetY - this.engineerCamera.position.y) * 0.05;
		this.engineerCamera.lookAt(0, 1.5, -5);
	}

	// Fly camera to position (for main menu → scene transition)
	flyCameraTo(camera, targetPos, targetLookAt, duration = 1.2) {
		return new Promise(resolve => {
			const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
			const startTime = performance.now();

			const fly = () => {
				const elapsed = performance.now() - startTime;
				const t = Math.min(elapsed / (duration * 1000), 1);
				// Ease in-out cubic
				const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

				camera.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
				camera.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
				camera.position.z = startPos.z + (targetPos.z - startPos.z) * ease;
				camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);

				if (t < 1) {
					requestAnimationFrame(fly);
				} else {
					resolve();
				}
			};
			fly();
		});
	}

	// Resize handler
	onResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		this.renderer.setSize(w, h);
		this.composer.setSize(w, h);

		[this.menuCamera, this.foremanCamera, this.engineerCamera, this.inspectorCamera].forEach(cam => {
			if (cam) {
				cam.aspect = w / h;
				cam.updateProjectionMatrix();
			}
		});
	}

	// Raycast
	raycast(objects) {
		this.raycaster.setFromCamera(this.mouse, this.activeCamera);
		return this.raycaster.intersectObjects(objects, true);
	}

	// Main render loop
	animate(callback) {
		const loop = () => {
			requestAnimationFrame(loop);
			const delta = this.clock.getDelta();
			if (this.controls && this.controls.enabled) this.controls.update();
			if (callback) callback(delta);
			this.composer.render();
		};
		loop();
	}

	dispose() {
		window.removeEventListener("resize", () => this.onResize());
		this.renderer.dispose();
		this.composer.dispose();
	}
}

export default SceneManager;
