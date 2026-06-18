import { Canvas } from '@react-three/fiber';
import { Image, PresentationControls, Environment } from '@react-three/drei';

export default function Scene() {
  return (
    // 撑满整个屏幕的 Canvas 容器
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* 提供环境光反射，让画面更有质感 */}
        <Environment preset="city" />
        
        {/* 允许用户通过鼠标拖拽进行带有弹性的 3D 视角微调 */}
        <PresentationControls 
          global 
          zoom={0.8} 
          rotation={[0, 0, 0]} 
          polar={[-0.1, 0.1]} // 限制上下旋转角度
          azimuth={[-0.5, 0.5]} // 限制左右旋转角度
          config={{ mass: 2, tension: 400 }}
        >
          <group position={[0, 0, 0]}>
            {/* 左侧海报 - 推远并旋转 */}
            <Image 
              url="/images/yaki-sugi.jpg" 
              position={[-2.5, 0, -1.5]} 
              rotation={[0, 0.4, 0]} 
              scale={[2, 2.8]} 
            />
            
            {/* 中央海报 - 焦点 */}
            <Image 
              url="/images/center.jpg" 
              position={[0, 0, 0]} 
              scale={[2.2, 3]} 
            />
            
            {/* 右侧海报 - 推远并反向旋转 */}
            <Image 
              url="/images/right.jpg" 
              position={[2.5, 0, -1.5]} 
              rotation={[0, -0.4, 0]} 
              scale={[2, 2.8]} 
            />
          </group>
        </PresentationControls>
      </Canvas>
    </div>
  );
}