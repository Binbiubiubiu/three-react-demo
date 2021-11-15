import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { ArrayCamera, Mesh, PerspectiveCamera, Vector4 } from "three";
import { PageCanvas } from "../components";

const AMOUNT = 6;

function Box() {
  const meshRef = useRef<Mesh>(null!);
  useFrame(() => {
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.z += 0.01;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <cylinderBufferGeometry args={[0.5, 0.5, 1, 32]} />
      <meshPhongMaterial color="#ff0000" />
    </mesh>
  );
}

function Bg() {
  return (
    <mesh receiveShadow position={[0, 0, -1]}>
      <planeGeometry args={[100, 100]} />
      <meshPhongMaterial color="#000066" />
    </mesh>
  );
}

function Scene() {
  const set = useThree((state) => state.set);
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ASPECT_RATIO = width/ height;

    const WIDTH = (width / AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (height/ AMOUNT) * window.devicePixelRatio;
    const cameras = [];
    for (let y = 0; y < AMOUNT; y++) {
      for (let x = 0; x < AMOUNT; x++) {
        const subcamera = new PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
        (subcamera as any).viewport = new Vector4(
          Math.floor(x * WIDTH),
          Math.floor(y * HEIGHT),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT)
        );
        subcamera.position.x = x / AMOUNT - 0.5;
        subcamera.position.y = 0.5 - y / AMOUNT;
        subcamera.position.z = 1.5;
        subcamera.position.multiplyScalar(2);
        subcamera.lookAt(0, 0, 0);
        subcamera.updateMatrixWorld();
        cameras.push(subcamera);
      }
    }
    const camera = new ArrayCamera(cameras);
    camera.position.z = 3;
    set({ camera });
  }, [set]);

  return (
    <>
      <Bg />
      <Box />
    </>
  );
}

export default function Page() {
  return (
    <PageCanvas shadows>
      <ambientLight args={["#222244"]} />
      <directionalLight
        args={[0xffffff]}
        position={[0.5, 0.5, 1]}
        castShadow
        shadow-camera-zoom={4}
      />
      <Scene />
    </PageCanvas>
  );
}
