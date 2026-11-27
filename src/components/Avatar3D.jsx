import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function Model() {
  // Aapki uploaded 3D file ka naam yahan hai
  const { scene } = useGLTF('/assets/Anime-Girl.glb');
  const modelRef = useRef();
  
  // Model ko halka sa rotate karne ke liye (idle animation)
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return <primitive object={scene} ref={modelRef} position={[0, -1.5, 0]} scale={2} />;
}

export default function Avatar3D() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="red" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="blue" />
        <Model />
        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.7} scale={10} blur={2.5} far={4} />
        <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
