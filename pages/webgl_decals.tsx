import React, { useCallback, useEffect, useMemo } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { DecalGeometry, Line2 } from "three-stdlib";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshNormalMaterial,
  MeshPhongMaterial,
  Vector2,
  Vector3,
} from "three";
import { MeshProps, ThreeEvent, useThree } from "@react-three/fiber";
import { ModelLoading, PageCanvas } from "../components";
import { button, useControls } from "leva";

declare module window {
  let line: Line;
  let mouseHelper: Mesh;
}

const MODEL_URL = "/models/gltf/LeePerrySmith/LeePerrySmith.glb";
const MAP_URL = "/models/gltf/LeePerrySmith/Map-COL.jpg";
const SPECULAR_URL = "/models/gltf/LeePerrySmith/Map-SPEC.jpg";
const NORMALMAP_URL =
  "/models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg";

useGLTF.preload([
  MODEL_URL,
  MAP_URL,
  SPECULAR_URL,
  NORMALMAP_URL,
  "textures/decal/decal-diffuse.png",
  "textures/decal/decal-normal.jpg",
]);

function Men(_: MeshProps) {
  const [map, specularMap, normalMap, decalDiffuse, decalNormal] = useTexture([
    MAP_URL,
    SPECULAR_URL,
    NORMALMAP_URL,
    "textures/decal/decal-diffuse.png",
    "textures/decal/decal-normal.jpg",
  ]);
  const glft = useGLTF(MODEL_URL);

  const paintMaterial = useMemo(() => {
    return new MeshPhongMaterial({
      specular: 0x444444,
      map: decalDiffuse,
      normalMap: decalNormal,
      normalScale: new Vector2(1, 1),
      shininess: 30,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    });
  }, [decalDiffuse, decalNormal]);

  const decals = useMemo<Mesh[]>(() => [], []);
  const size = useMemo<Vector3>(() => new Vector3(10, 10, 10), []);
  const scene = useThree((state) => state.scene);

  const { maxScale, minScale, rotate } = useControls({
    minScale: 10,
    maxScale: 20,
    rotate: true,
    clear: button(() => {
      scene.remove(...decals);
      decals.splice(0, decals.length);
    }),
  });

  return (
    <primitive
      object={glft.scene.children[0]}
      scale={[10, 10, 10]}
      onPointerMove={useCallback((e: ThreeEvent<MouseEvent>) => {
        const { intersections, object: mesh } = e;
        if (intersections.length > 0) {
          const p = intersections[0].point;
          const positions = window.line.geometry.attributes.position;

          const n = intersections[0].face!.normal.clone();
          n.transformDirection(mesh.matrixWorld);
          n.multiplyScalar(10);
          n.add(intersections[0].point);

          positions.setXYZ(0, p.x, p.y, p.z);
          positions.setXYZ(1, n.x, n.y, n.z);
          positions.needsUpdate = true;
        }
      }, [])}
      onClick={useCallback(
        (e: ThreeEvent<MouseEvent>) => {
          const { intersections, object: mesh } = e;
          const p = intersections[0].point;
          window.mouseHelper.position.copy(p);

          const n = intersections[0].face!.normal.clone();
          n.transformDirection(mesh.matrixWorld);
          n.multiplyScalar(10);
          n.add(intersections[0].point);

          window.mouseHelper.lookAt(n!);

          const positions = window.line.geometry.attributes.position;
          positions.setXYZ(0, p.x, p.y, p.z);
          positions.setXYZ(1, n.x, n.y, n.z);
          positions.needsUpdate = true;

          const position = p;
          const orientation = window.mouseHelper.rotation;

          if (rotate) orientation.z = Math.random() * 2 * Math.PI;

          const scale = minScale + Math.random() * (maxScale - minScale);
          size.set(scale, scale, scale);

          const material = paintMaterial.clone();
          material.color.setHex(Math.random() * 0xffffff);

          const m = new Mesh(
            new DecalGeometry(mesh as Mesh, position, orientation, size),
            material
          );
          decals.push(m);
          scene.add(m);
        },
        [decals, paintMaterial, maxScale, minScale, rotate, scene, size]
      )}
    >
      <meshPhongMaterial
        {...{
          specular: new Color(0x111111),
          map,
          specularMap,
          normalMap,
          shininess: 25,
        }}
      />
    </primitive>
  );
}

function Scene() {
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    const geometry = new BufferGeometry();
    geometry.setFromPoints([new Vector3(), new Vector3()]);
    const line = (window.line = new Line(geometry, new LineBasicMaterial()));
    scene.add(line);

    const mouseHelper = (window.mouseHelper = new Mesh(
      new BoxGeometry(1, 1, 10),
      new MeshNormalMaterial()
    ));
    mouseHelper.visible = false;
    scene.add(mouseHelper);
  }, [scene]);

  return (
    <ModelLoading>
      <Men />
    </ModelLoading>
  );
}

export default function Page() {
  return (
    <PageCanvas>
      <color args={[0x000]} attach="background" />
      <PerspectiveCamera
        makeDefault
        fov={45}
        far={1000}
        position={[0, 0, 120]}
      />
      <OrbitControls minDistance={50} maxDistance={200} />
      <ambientLight args={[0x443333]} />
      <directionalLight args={[0xffddcc, 1]} position={[1, 0.75, 0.5]} />
      <directionalLight args={[0xccccff, 1]} position={[-1, 0.75, -0.5]} />

      <Scene />
    </PageCanvas>
  );
}
