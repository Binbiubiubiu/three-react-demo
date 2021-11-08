import React, { useEffect, useRef } from "react";
import { Color, PMREMGenerator } from "three";
import { RoomEnvironment } from "three-stdlib";
import { Canvas, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  OrbitControls,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import { ModelLoading, PageLayout } from "../components";

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

useGLTF.preload(url);

function Scene() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    scene.background = new Color(0xbfe3dd);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
  }, [gl, scene]);
  return (
    <ModelLoading>
      <House />
    </ModelLoading>
  );
}

export default function Page() {
  return (
    <PageLayout>
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[5, 2, 8]}
          fov={40}
          far={100}
        />
        <OrbitControls target={[0, 0.5, 0]} enablePan={false} />
        <Scene />
      </Canvas>
    </PageLayout>
  );
}
