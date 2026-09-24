import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundCanvas({ theme = 'dark' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, particles, animationFrameId;

    try {
      // Scene, Camera, Renderer Setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 100;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Create Particles / Plexus Points
      const particleCount = window.innerWidth < 768 ? 40 : 80;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const velocities = [];

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

        velocities.push({
          x: (Math.random() - 0.5) * 0.12,
          y: (Math.random() - 0.5) * 0.12,
          z: (Math.random() - 0.5) * 0.08,
        });
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Material with color adapted to theme
      const particleColor = theme === 'dark' ? 0x3b82f6 : 0x2563eb;
      const material = new THREE.PointsMaterial({
        color: particleColor,
        size: 2.2,
        transparent: true,
        opacity: theme === 'dark' ? 0.5 : 0.35,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Mouse Interaction
      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.04;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.04;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Window Resize Handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      // Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        scene.rotation.y += (mouseX * 0.005 - scene.rotation.y) * 0.05;
        scene.rotation.x += (mouseY * 0.005 - scene.rotation.x) * 0.05;

        const positionAttr = geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          positionAttr.setX(i, positionAttr.getX(i) + velocities[i].x);
          positionAttr.setY(i, positionAttr.getY(i) + velocities[i].y);
          positionAttr.setZ(i, positionAttr.getZ(i) + velocities[i].z);

          if (Math.abs(positionAttr.getX(i)) > 120) velocities[i].x *= -1;
          if (Math.abs(positionAttr.getY(i)) > 120) velocities[i].y *= -1;
          if (Math.abs(positionAttr.getZ(i)) > 60) velocities[i].z *= -1;
        }
        positionAttr.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (container && renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch (err) {
      console.warn('WebGL initialization skipped:', err);
    }
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 transition-opacity duration-700"
    />
  );
}
