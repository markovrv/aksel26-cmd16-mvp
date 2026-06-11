// EntryScreen.js — Экран входа (имя + аватар) с 3D-фоном
import * as THREE from "three";

export class EntryScreen {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("entry");
		this.floatingShapes = [];
		this.init();
	}

	init() {
		this.createFloatingShapes();
	}

	createFloatingShapes() {
		const group = this.group;
		const colors = [0xff6b35, 0x2563eb, 0x22c55e, 0xf59e0b, 0xef4444, 0x8b5cf6];
		const geometries = [
			new THREE.BoxGeometry(0.3, 0.3, 0.3),
			new THREE.ConeGeometry(0.2, 0.4, 6),
			new THREE.OctahedronGeometry(0.2),
			new THREE.TorusGeometry(0.15, 0.05, 8, 12),
		];

		for (let i = 0; i < 20; i++) {
			const geo = geometries[i % geometries.length];
			const mat = new THREE.MeshStandardMaterial({
				color: colors[i % colors.length],
				transparent: true,
				opacity: 0.2 + Math.random() * 0.2,
				roughness: 0.5,
				metalness: 0.3,
			});
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.set(
				(Math.random() - 0.5) * 12,
				(Math.random() - 0.5) * 8,
				(Math.random() - 0.5) * 8 - 2,
			);
			mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
			mesh.userData = {
				rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 },
				floatSpeed: 0.5 + Math.random() * 0.5,
				floatOffset: Math.random() * Math.PI * 2,
				baseY: mesh.position.y,
			};
			group.add(mesh);
			this.floatingShapes.push(mesh);
		}
	}

	show() {
		this.group.visible = true;
	}

	hide() {
		this.group.visible = false;
	}

	update(time) {
		if (!this.group.visible) return;
		this.floatingShapes.forEach((mesh, i) => {
			mesh.rotation.x += mesh.userData.rotSpeed.x;
			mesh.rotation.y += mesh.userData.rotSpeed.y;
			mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.2;
		});
	}

	dispose() {
		this.group.traverse(child => {
			if (child.geometry) child.geometry.dispose();
			if (child.material) child.material.dispose();
		});
	}
}

export default EntryScreen;
