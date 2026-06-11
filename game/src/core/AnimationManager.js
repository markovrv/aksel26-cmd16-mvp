// AnimationManager.js — GSAP анимации для объектов сцены
import * as THREE from "three";
import gsap from "gsap";

export class AnimationManager {
	constructor() {
		this.animations = [];
		this.idleAnimations = [];
	}

	// Float animation (idle)
	float(object, amplitude = 0.1, duration = 3) {
		const anim = gsap.to(object.position, {
			y: object.position.y + amplitude,
			duration: duration / 2,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});

		this.idleAnimations.push({ object, animation: anim });
		return anim;
	}

	// Scale hover effect
	hoverScale(object, scale = 1.1, duration = 0.2) {
		gsap.to(object.scale, {
			x: scale,
			y: scale,
			z: scale,
			duration,
			ease: "power2.out",
		});
	}

	// Scale unhover
	unhoverScale(object, scale = 1, duration = 0.2) {
		gsap.to(object.scale, {
			x: scale,
			y: scale,
			z: scale,
			duration,
			ease: "power2.out",
		});
	}

	// Camera fly to position
	cameraFlyTo(camera, target, duration = 1.5, onComplete = null) {
		gsap.to(camera.position, {
			x: target.x,
			y: target.y,
			z: target.z,
			duration,
			ease: "power2.inOut",
			onUpdate: () =>
				camera.lookAt(
					target.lookAt || 0,
					target.lookAtY || 0,
					target.lookAtZ || 0,
				),
			onComplete,
		});
	}

	// Camera look at target
	cameraLookAt(camera, target, duration = 0.5) {
		gsap.to(camera.rotation, {
			x: target.x,
			y: target.y,
			z: target.z,
			duration,
			ease: "power2.out",
		});
	}

	// Grow from ground (for walls)
	growFromGround(object, duration = 1, delay = 0) {
		object.scale.y = 0;

		gsap.to(object.scale, {
			y: 1,
			duration,
			delay,
			ease: "power2.out",
		});
	}

	// Object appears (fade in via material)
	fadeIn(object, duration = 0.5) {
		if (object.material) {
			object.material.transparent = true;
			object.material.opacity = 0;

			gsap.to(object.material, {
				opacity: 1,
				duration,
				ease: "power2.out",
			});
		}
	}

	// Object disappears (fade out via material)
	fadeOut(object, duration = 0.5, onComplete = null) {
		if (object.material) {
			object.material.transparent = true;

			gsap.to(object.material, {
				opacity: 0,
				duration,
				ease: "power2.out",
				onComplete: () => {
					object.visible = false;
					if (onComplete) onComplete();
				},
			});
		} else {
			if (onComplete) onComplete();
		}
	}

	// Move object to position
	moveTo(object, target, duration = 1, ease = "power2.inOut") {
		gsap.to(object.position, {
			x: target.x,
			y: target.y,
			z: target.z,
			duration,
			ease,
		});
	}

	// Rotate continuously
	rotateContinuous(object, speed = 0.05, axis = "y") {
		object.userData.rotationSpeed = speed;
		object.userData.rotationAxis = axis;
	}

	// Blink (toggle visibility/intensity)
	blink(object, duration = 0.5, times = 3) {
		let count = 0;
		const originalEmissive = object.material?.emissiveIntensity || 1;

		const blinkInterval = setInterval(
			() => {
				if (object.material) {
					object.material.emissiveIntensity =
						object.material.emissiveIntensity > 0.5 ? 0.2 : originalEmissive;
				} else if (object.material) {
					object.material.opacity = object.material.opacity > 0.5 ? 0.2 : 1;
				}

				count++;
				if (count >= times * 2) {
					clearInterval(blinkInterval);
					if (object.material) {
						object.material.emissiveIntensity = originalEmissive;
					}
				}
			},
			(duration * 1000) / (times * 2),
		);

		return blinkInterval;
	}

	// Pulse glow
	pulseGlow(light, minIntensity = 0.3, maxIntensity = 1, duration = 1) {
		gsap.to(light, {
			intensity: maxIntensity,
			duration: duration / 2,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});
	}

	// Color transition
	colorTo(object, targetColor, duration = 0.5) {
		if (object.material) {
			const color = new THREE.Color(targetColor);
			gsap.to(object.material.color, {
				r: color.r,
				g: color.g,
				b: color.b,
				duration,
				ease: "power2.out",
			});
		}
	}

	// Shake
	shake(object, intensity = 0.1, duration = 0.5) {
		const originalPos = {
			x: object.position.x,
			y: object.position.y,
			z: object.position.z,
		};

		gsap.to(object.position, {
			x: originalPos.x + (Math.random() - 0.5) * intensity,
			y: originalPos.y + (Math.random() - 0.5) * intensity,
			z: originalPos.z + (Math.random() - 0.5) * intensity,
			duration: duration / 5,
			ease: "power1.inOut",
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				object.position.set(originalPos.x, originalPos.y, originalPos.z);
			},
		});
	}

	// Score popup animation
	showScorePopup(position, score, scene, camera) {
		const canvas = document.createElement("canvas");
		canvas.width = 200;
		canvas.height = 80;
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#22C55E";
		ctx.font = "bold 48px Montserrat";
		ctx.textAlign = "center";
		ctx.fillText(`+${score}`, 100, 55);

		const texture = new THREE.CanvasTexture(canvas);
		const material = new THREE.SpriteMaterial({
			map: texture,
			transparent: true,
		});

		const sprite = new THREE.Sprite(material);
		sprite.position.copy(position);
		sprite.scale.set(1.5, 0.6, 1);
		scene.add(sprite);

		gsap.to(sprite.position, {
			y: position.y + 2,
			duration: 1.5,
			ease: "power2.out",
		});

		gsap.to(sprite.material, {
			opacity: 0,
			duration: 1.5,
			delay: 0.5,
			onComplete: () => {
				scene.remove(sprite);
				sprite.material.dispose();
			},
		});
	}

	// Truck drive animation
	truckDriveIn(truck, targetZ = -4, duration = 2) {
		const startZ = truck.position.z;
		truck.position.z = -20;

		gsap.to(truck.position, {
			z: targetZ,
			duration,
			ease: "power2.out",
		});
	}

	truckDriveOut(truck, duration = 2) {
		gsap.to(truck.position, {
			z: -20,
			duration,
			ease: "power2.in",
			onComplete: () => {
				truck.visible = false;
			},
		});
	}

	// Worker walk to position
	workerWalkTo(worker, targetPos, duration = 1.5) {
		gsap.to(worker.position, {
			x: targetPos.x,
			y: targetPos.y,
			z: targetPos.z,
			duration,
			ease: "power1.inOut",
		});
	}

	// Breathing animation (scale oscillation)
	breathe(object, scaleDelta = 0.01, duration = 2) {
		gsap.to(object.scale, {
			y: 1 + scaleDelta,
			duration: duration / 2,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});
	}

	// Stop all animations for object
	stopAnimations(object) {
		this.idleAnimations = this.idleAnimations.filter((anim) => {
			if (anim.object === object) {
				anim.animation.kill();
				return false;
			}
			return true;
		});

		gsap.killTweensOf(object.position);
		gsap.killTweensOf(object.scale);
		gsap.killTweensOf(object.rotation);
	}

	// Stop all
	stopAll() {
		gsap.killAll();
		this.idleAnimations.forEach((anim) => anim.animation.kill());
		this.idleAnimations = [];
	}

	// Update called in render loop
	update(delta) {
		// Update continuous rotations
		this.idleAnimations.forEach(({ object, animation }) => {
			if (object.userData.rotationSpeed) {
				const axis = object.userData.rotationAxis || "y";
				object.rotation[axis] += object.userData.rotationSpeed;
			}
		});
	}
}

export default AnimationManager;
