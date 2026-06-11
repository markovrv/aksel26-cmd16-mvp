// ResultScreen.js — Экран результатов (управляется UIManager, 3D-конфетти декорации)
import * as THREE from "three";

export class ResultScreen {
	constructor(sceneManager) {
		this.sceneManager = sceneManager;
		this.group = sceneManager.createGroup("results");
		this.confettiParticles = [];
		this._active = false;
	}

	show() {
		this.group.visible = true;
		this._active = true;
		this.createConfetti3D();
	}

	hide() {
		this.group.visible = false;
		this._active = false;
		this.destroyConfetti3D();
	}

	createConfetti3D() {
		const g = this.group;
		const colors = [0xff6b35, 0x2563eb, 0x22c55e, 0xf59e0b, 0xef4444, 0x8b5cf6, 0xec4899, 0x14b8a6];

		for (let i = 0; i < 100; i++) {
			const geo = new THREE.BoxGeometry(0.05 + Math.random() * 0.1, 0.02, 0.05 + Math.random() * 0.1);
			const mat = new THREE.MeshStandardMaterial({
				color: colors[Math.floor(Math.random() * colors.length)],
				roughness: 0.5,
			});
			const particle = new THREE.Mesh(geo, mat);
			particle.position.set(
				(Math.random() - 0.5) * 12,
				6 + Math.random() * 4,
				(Math.random() - 0.5) * 8 - 2,
			);
			particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
			particle.userData = {
				velX: (Math.random() - 0.5) * 0.3,
				velZ: (Math.random() - 0.5) * 0.2,
				rotSpeed: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
			};
			g.add(particle);
			this.confettiParticles.push(particle);
		}
	}

	destroyConfetti3D() {
		this.confettiParticles.forEach(p => {
			if (p.geometry) p.geometry.dispose();
			if (p.material) p.material.dispose();
			this.group.remove(p);
		});
		this.confettiParticles = [];
	}

	update(delta) {
		if (!this._active || !this.group.visible) return;
		this.confettiParticles.forEach(p => {
			p.position.y -= delta * 0.8;
			p.position.x += Math.sin(performance.now() / 1000 + p.id) * delta * 0.1;
			p.rotation.x += p.userData.rotSpeed.x * delta;
			p.rotation.y += p.userData.rotSpeed.y * delta;

			// Reset if fallen below
			if (p.position.y < -4) {
				p.position.y = 6 + Math.random() * 2;
				p.position.x = (Math.random() - 0.5) * 12;
			}
		});
	}
}

export default ResultScreen;
