import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PageCanvas } from "../components";

export function Box() {
  const mash = useRef<THREE.Mesh>();
  useFrame((state, delta) => {
    mash.current!.rotation.x += delta;
    mash.current!.rotation.y += delta;
  });
  return (
    <mesh
      ref={mash}
      onClick={(e) => console.log("click")}
      onContextMenu={(e) => console.log("context menu")}
      onDoubleClick={(e) => console.log("double click")}
      onWheel={(e) => console.log("wheel spins")}
      onPointerUp={(e) => console.log("up")}
      onPointerDown={(e) => console.log("down")}
      onPointerOver={(e) => console.log("over")}
      onPointerOut={(e) => console.log("out")}
      onPointerEnter={(e) => console.log("enter")} // see note 1
      onPointerLeave={(e) => console.log("leave")} // see note 1
      onPointerMove={(e) => console.log("move")}
      onPointerMissed={() => console.log("missed")}
      onUpdate={(self) => console.log("props have been updated")}
    >
      <octahedronGeometry></octahedronGeometry>
      <meshStandardMaterial></meshStandardMaterial>
    </mesh>
  );
}

export default function FirstDemoPage() {
  return (
    <PageCanvas>
      <ambientLight intensity={0.1} />
      <directionalLight color="red" position={[0, 0, 5]}></directionalLight>
      <Box />
    </PageCanvas>
  );
}
