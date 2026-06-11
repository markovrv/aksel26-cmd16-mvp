// ProfessionIntro.js — Экран знакомства с профессией + 3D-превью
import * as THREE from "three";

export class ProfessionIntro {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("intro");
		this.previewCanvas = null;
		this.previewRenderer = null;
		this.previewScene = null;
		this.previewCamera = null;
		this.previewModel = null;
		this.previewWorker = null;
	}

	show(profession) {
		this.group.visible = true;
		this.createPreview(profession);
	}

	hide() {
		this.group.visible = false;
		this.destroyPreview();
	}

	createPreview(profession) {
		// Create a small canvas for the 3D preview
		this.previewCanvas = document.getElementById("preview-canvas");
		if (!this.previewCanvas) return;

		this.previewRenderer = new THREE.WebGLRenderer({
			canvas: this.previewCanvas,
			antialias: true,
			alpha: true,
		});
		this.previewRenderer.setSize(200, 200);
		this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		this.previewScene = new THREE.Scene();
		this.previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
		this.previewCamera.position.set(0, 0.8, 2);
		this.previewCamera.lookAt(0, 0.8, 0);

		// Ambient light
		this.previewScene.add(new THREE.AmbientLight(0xffffff, 0.5));

		// Directional light
		const dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(3, 5, 3);
		this.previewScene.add(dirLight);

		// Background
		const color = profession === "foreman" ? 0xff6b35 : 0x2563eb;
		this.previewScene.background = new THREE.Color(color);

		// Create worker model
		this.previewWorker = this.createWorkerModel(profession === "foreman" ? 0x3366cc : 0x2563eb);
		this.previewScene.add(this.previewWorker);

		// Rotating platform
		const platformGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
		const platformMat = new THREE.MeshStandardMaterial({
			color: 0x333344,
			roughness: 0.7,
			metalness: 0.3,
		});
		const platform = new THREE.Mesh(platformGeo, platformMat);
		platform.position.y = -0.3;
		this.previewScene.add(platform);

		// Start animation loop
		this.previewAnimId = requestAnimationFrame(() => this.updatePreview());
	}

	createWorkerModel(color) {
		const group = new THREE.Group();

		// Body
		const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.4, 4, 8);
		const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		body.position.y = 0.65;
		group.add(body);

		// Head
		const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
		const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.8 });
		const head = new THREE.Mesh(headGeo, headMat);
		head.position.y = 1.1;
		group.add(head);

		// Helmet
		const helmetGeo = new THREE.ConeGeometry(0.22, 0.12, 16);
		const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.5, metalness: 0.3 });
		const helmet = new THREE.Mesh(helmetGeo, helmetMat);
		helmet.position.y = 1.3;
		group.add(helmet);

		group.position.y = 0.4;
		return group;
	}

	updatePreview() {
		if (!this.previewRenderer || !this.previewScene || !this.previewCamera) return;
		if (this.previewWorker) {
			this.previewWorker.rotation.y += 0.015;
		}
		this.previewRenderer.render(this.previewScene, this.previewCamera);
		this.previewAnimId = requestAnimationFrame(() => this.updatePreview());
	}

	destroyPreview() {
		if (this.previewAnimId) cancelAnimationFrame(this.previewAnimId);
		if (this.previewRenderer) {
			this.previewRenderer.dispose();
			this.previewRenderer = null;
		}
		this.previewScene = null;
		this.previewCamera = null;
		this.previewWorker = null;
	}

	update(delta) {
		// Preview handles itself
	}
}

export default ProfessionIntro;
