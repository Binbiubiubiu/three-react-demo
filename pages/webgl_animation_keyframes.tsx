import React, { Suspense, useEffect, useRef } from "react";
import { Color, PMREMGenerator } from "three";
import { RoomEnvironment} from "three-stdlib";
import { Canvas, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  Html,
  useProgress,
  useGLTF,
  useAnimations,
} from "@react-three/drei";

const url = "/models/gltf/LittlestTokyo.glb";

export function House() {
  const gltf = useGLTF(url, "/js/libbs/draco/gltf");

  const ref = useRef();
  const { actions, names } = useAnimations(gltf.animations, ref);
  React.useEffect(() => {
    actions[names[0]]?.play();
  }, [actions, names]);

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      position={[1, 1, 0]}
      scale={[0.01, 0.01, 0.01]}
    />
  );
}

useGLTF.preload(url)

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

function Scene() {
  const state = useThree();

  useEffect(() => {
    const { gl, scene } = state;
    const pmremGenerator = new PMREMGenerator(gl);
    scene.background = new Color(0xbfe3dd);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,0.1
    ).texture;
  }, [state]);
  return (
    <Suspense fallback={<Loader />}>
      <House />
    </Suspense>
  );
}

export default function Page() {
  return (
    <div className="full-window">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 2, 8]} fov={40} far={100} />
        <OrbitControls
          target={[0, 0.5, 0]}
          enablePan={false}
        />
        <Scene />
      </Canvas>
    </div>
  );
}
