import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import type { CreatorProfile } from '../../types/creator';
import { formatPriceRange } from '../../utils/format';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { SafeAvatar } from '../ui/SafeAvatar';

interface CreatorGalaxyProps {
  creators: CreatorProfile[];
  selectedCategory?: string;
  searchQuery?: string;
}

const CATEGORY_COLORS: Record<string, number> = {
  'AI Video Generation': 0xef4444, // Red
  'AI Advertising': 0xf59e0b, // Amber
  'AI Photography': 0x10b981, // Emerald
  '3D Art and Animation': 0x3b82f6, // Blue
  'AI Graphic Design': 0x8b5cf6, // Violet
  'AI Avatars': 0xec4899, // Pink
  'Product Visualization': 0x06b6d4, // Cyan
  'AI-Assisted Creative Development': 0xeab308, // Yellow
};

export function CreatorGalaxy({
  creators,
  selectedCategory: _selectedCategory,
  searchQuery: _searchQuery,
}: CreatorGalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [hoveredCreator, setHoveredCreator] = useState<CreatorProfile | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b1e, 0.015);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 45;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa78bfa, 2, 100);
    pointLight.position.set(0, 10, 20);
    scene.add(pointLight);

    // Group for nodes & connections
    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // Starfield Background Particles
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 160;
      starPositions[i + 1] = (Math.random() - 0.5) * 160;
      starPositions[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Map creators to 3D sphere positions clustered by category
    const nodeMeshes: THREE.Mesh[] = [];
    const creatorMap = new Map<THREE.Mesh, CreatorProfile>();

    const categoriesList = Object.keys(CATEGORY_COLORS);

    creators.forEach((creator, idx) => {
      const primaryCat = creator.categories[0] || 'AI Video Generation';
      const catIndex = categoriesList.indexOf(primaryCat);
      const angle = (catIndex / categoriesList.length) * Math.PI * 2;
      const radius = 18 + ((idx % 3) * 5);

      // Cluster offset
      const clusterOffset = 4.5;
      const x = Math.cos(angle) * radius + (Math.sin(idx * 2) * clusterOffset);
      const y = Math.sin(angle) * radius + (Math.cos(idx * 3) * clusterOffset);
      const z = (Math.sin(idx * 4) * 10);

      const colorHex = CATEGORY_COLORS[primaryCat] || 0x7c3aed;
      const geometry = new THREE.SphereGeometry(1.4, 32, 32);

      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      galaxyGroup.add(mesh);
      nodeMeshes.push(mesh);
      creatorMap.set(mesh, creator);
    });

    // Connection lines between creators sharing common skills
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.15,
    });

    for (let i = 0; i < creators.length; i++) {
      for (let j = i + 1; j < creators.length; j++) {
        const c1 = creators[i];
        const c2 = creators[j];
        const commonSkills = c1.skills.filter((s) => c2.skills.includes(s));
        if (commonSkills.length >= 2) {
          const m1 = nodeMeshes[i];
          const m2 = nodeMeshes[j];
          if (m1 && m2) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              m1.position,
              m2.position,
            ]);
            const line = new THREE.Line(lineGeo, lineMaterial);
            galaxyGroup.add(line);
          }
        }
      }
    }

    // Raycaster for Mouse Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse drag rotation state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      // Handle orbit rotation
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        galaxyGroup.rotation.y += deltaX * 0.005;
        galaxyGroup.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Check intersections
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const creator = creatorMap.get(hitMesh);
        if (creator) {
          setHoveredCreator(creator);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = 'pointer';
        }
      } else {
        if (!isDragging) {
          setHoveredCreator(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (_e: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const creator = creatorMap.get(hitMesh);
        if (creator) {
          setSelectedCreator(creator);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Subtle continuous slow rotation if not dragging
      if (!isDragging) {
        galaxyGroup.rotation.y += 0.0012;
      }
      starField.rotation.y -= 0.0004;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [creators]);

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-white/10 bg-midnight-950 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Galaxy HUD Overlay Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-midnight-900/80 px-3.5 py-1.5 backdrop-blur-md border border-white/10 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-gray-300">
          Click or drag nodes to rotate • <strong>{creators.length} Creator Nodes</strong>
        </span>
      </div>

      {/* Category Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-wrap gap-2 max-w-xl p-2.5 rounded-2xl bg-midnight-900/80 backdrop-blur-md border border-white/10 text-[11px]">
        {Object.entries(CATEGORY_COLORS).map(([cat, colorHex]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `#${colorHex.toString(16).padStart(6, '0')}` }}
            />
            <span className="text-gray-300">{cat}</span>
          </div>
        ))}
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredCreator && (
        <div
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 15}px`,
          }}
          className="pointer-events-none absolute z-20 w-64 rounded-2xl border border-violet-500/30 bg-midnight-900/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <SafeAvatar
              src={hoveredCreator.avatarUrl}
              name={hoveredCreator.displayName}
              size="md"
              shape="rounded"
              className="border border-violet-500/40"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-white text-sm truncate">
                {hoveredCreator.displayName}
              </h4>
              <p className="text-[11px] text-violet-300 truncate">
                {hoveredCreator.categories[0]}
              </p>
            </div>
          </div>
          <p className="line-clamp-2 text-[11px] text-gray-300 mb-2">
            {hoveredCreator.headline}
          </p>
          <div className="flex justify-between items-center text-[11px] font-semibold text-white pt-2 border-t border-white/10">
            <span>Rate</span>
            <span>{formatPriceRange(hoveredCreator.priceRange.min, hoveredCreator.priceRange.max)}</span>
          </div>
        </div>
      )}

      {/* Selected Creator Drawer Card */}
      {selectedCreator && (
        <div className="absolute top-4 right-4 z-20 w-80 rounded-3xl border border-violet-500/40 bg-midnight-900/95 p-5 shadow-2xl backdrop-blur-2xl text-left space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <SafeAvatar
                src={selectedCreator.avatarUrl}
                name={selectedCreator.displayName}
                size="lg"
                shape="rounded"
                className="border-2 border-violet-500/40"
              />
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedCreator.displayName}
                </h3>
                <span className="text-xs text-violet-300">
                  {selectedCreator.categories[0]}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCreator(null)}
              className="text-gray-400 hover:text-white text-sm p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
            {selectedCreator.biography}
          </p>

          <div className="flex flex-wrap gap-1">
            {selectedCreator.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] text-gray-300"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-400">Indicative Rate:</span>
            <strong className="text-white">
              {formatPriceRange(selectedCreator.priceRange.min, selectedCreator.priceRange.max)}
            </strong>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              className="w-full text-xs"
              onClick={() => navigate(`/creators/${selectedCreator.uid}`)}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open Full Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
