"use client";

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, shaderMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 1. 定义自定义“全息 X光”着色器材质
const HolographicMaterial = shaderMaterial(
  { 
    glowColor: new THREE.Color('#3B82F6'), // 边缘发光颜色
    fresnelPower: 2.0,                     // 边缘发光强弱系数（数值越小越亮）
  },
  // 顶点着色器 (Vertex Shader)
  `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // 片段着色器 (Fragment Shader)
  `
  uniform vec3 glowColor;
  uniform float fresnelPower;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() {
    // 菲涅尔效应：计算视线与法线的夹角，使边缘亮、中间透明
    float fresnel = abs(dot(vNormal, -vPositionNormal));
    fresnel = 1.0 - fresnel;
    fresnel = pow(fresnel, fresnelPower);
    
    gl_FragColor = vec4(glowColor * fresnel * 2.0, fresnel * 0.85);
  }
  `
);

// 注册自定义材质
extend({ HolographicMaterial });

// 2. 真实 3D 模型渲染组件
function RealBrainModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  // 从 public/Brain.gltf 加载模型
  // 注意：请确保你的 Brain.gltf 文件（及相关的 .bin 文件）已放入项目的 public 文件夹中
  const { nodes } = useGLTF('/Brain.gltf');

  // 让真实的 3D 大脑平滑自转并微微上下浮动
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={2.0} position={[0, 0, 0]}>
      {/* 提示：nodes.Brain_Mesh 需要对应你 3D 模型内部的节点名称。
        如果控制台报错提示找不到 geometry，可以尝试在控制台 console.log(nodes) 
        查看你下载的模型中具体的 Mesh 名称并替换这里的 'Brain_Mesh'。
      */}
      {nodes.Brain_Mesh && (
        <mesh geometry={(nodes.Brain_Mesh as THREE.Mesh).geometry}>
          {/* @ts-ignore */}
          <holographicMaterial 
            transparent 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
          />
        </mesh>
      )}
    </group>
  );
}

// 3. 内部神经元光点组件（模拟放电效果）
function NeuralNodes() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, sizes] = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // 在中心区域随机散落光点
      const r = 0.8 * Math.cbrt(Math.random()); 
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.1;
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8 + 0.1;
      pos[i * 3 + 2] = r * Math.cos(phi) * 1.1;

      size[i] = Math.random() * 0.06 + 0.02;
    }
    return [pos, size];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// 4. 导出主组件
export default function BrainWireframe() {
  return (
    <div className="w-full h-full relative cursor-move group">
      <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }}>
        {/* 用 Suspense 包裹异步加载的 3D 模型，避免加载期间阻塞渲染 */}
        <Suspense fallback={null}>
          <RealBrainModel />
          <NeuralNodes />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      {/* 右上角微小的 HUD 扫描提示状态 */}
      <div className="absolute top-[12%] left-[5%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
          <span className="text-[10px] tracking-widest text-[#1E3A8A] border border-[#1E3A8A]/20 bg-white/50 px-1.5 backdrop-blur-sm">
            模型联调成功 // MESH.LOADED
          </span>
        </div>
      </div>
    </div>
  );
}