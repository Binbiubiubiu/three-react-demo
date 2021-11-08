import { useRef } from "react";
import { useTexture, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import {ModelLoading,PageLayout} from "../components";

const TEXTURE_URL = "/textures/crate.gif";

function Box() {
  const mesh = useRef<Mesh>(null!);
  const texture = useTexture(TEXTURE_URL);
  useFrame(() => {
    mesh.current.rotation.x += 0.005;
    mesh.current.rotation.y += 0.005;
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[200, 200, 200]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

useTexture.preload(TEXTURE_URL);

function Scene() {
  return (
    <ModelLoading>
      <Box />
    </ModelLoading>
  );
}

export default function Page() {
  return (
    <PageLayout>
      <Canvas>
        <color args={[0, 0, 0]} attach="background" />
        <PerspectiveCamera makeDefault fov={70} far={1000} position-z={400} />
        <Scene />
      </Canvas>
    </PageLayout>
  );
}
