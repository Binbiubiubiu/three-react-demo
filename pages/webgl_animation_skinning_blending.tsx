import React, { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Color, Fog, AnimationAction, AnimationMixer } from "three";
import { button, useControls } from "leva";
import { ModelLoading, PageCanvas } from "../components";
import { useAnimationCustom } from "../hooks";

const MODEL_URL = "/models/gltf/Soldier.glb";
declare module window {
  let modifyStepSize: number;
  let idleAction: AnimationAction | null;
  let walkAction: AnimationAction | null;
  let runAction: AnimationAction | null;
  let actions: Array<AnimationAction | null>;
  let mixer: AnimationMixer;
  let singleStepMode: boolean;
  let sizeOfNextStep: number;
  let useDefaultDuration: boolean;
  let setCustomDuration: number;
}

function pauseContinue() {
  const { idleAction, singleStepMode } = window;
  if (singleStepMode) {
    window.singleStepMode = false;
    unPauseAllActions();
  } else {
    if (idleAction?.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}

function toSingleStepMode() {
  unPauseAllActions();
  window.singleStepMode = true;
  window.sizeOfNextStep = window.modifyStepSize;
  console.log(window.modifyStepSize);
}

function prepareCrossFade(
  startAction: AnimationAction | null,
  endAction: AnimationAction | null,
  defaultDuration: number
) {
  // Switch default / custom crossfade duration (according to the user's choice)

  const duration = setCrossFadeDuration(defaultDuration);

  // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

  unPauseAllActions();

  // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
  // else wait until the current action has finished its current loop

  if (startAction === window.idleAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }
}

function setCrossFadeDuration(defaultDuration: number) {
  // Switch default crossfade duration <-> custom crossfade duration

  if (window.useDefaultDuration) {
    return defaultDuration;
  } else {
    return window.setCustomDuration;
  }
}

function synchronizeCrossFade(
  startAction: AnimationAction | null,
  endAction: AnimationAction | null,
  duration: number
) {
  const { mixer } = window;
  mixer.addEventListener("loop", onLoopFinished);

  function onLoopFinished(event: any) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);

      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function executeCrossFade(
  startAction: AnimationAction | null,
  endAction: AnimationAction | null,
  duration: number
) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)

  setWeight(endAction, 1);
  endAction && (endAction.time = 0);

  // Crossfade with warping - you can also try without warping by setting the third parameter to false

  startAction?.crossFadeTo(endAction!, duration, true);
}

function setWeight(action: AnimationAction | null, weight: number) {
  action && (action.enabled = true);
  action?.setEffectiveTimeScale(1);
  action?.setEffectiveWeight(weight);
}

function initModel(
  modelRawActions: { [x: string]: AnimationAction | null },
  names: string[],
  mixer: AnimationMixer
) {
  const idleAction = (window.idleAction = modelRawActions[names[0]]);
  const walkAction = (window.walkAction = modelRawActions[names[3]]);
  const runAction = (window.runAction = modelRawActions[names[1]]);
  window.actions = [idleAction, walkAction, runAction];
  window.mixer = mixer;
  window.singleStepMode = false;
  window.sizeOfNextStep = 0.0;
  window.useDefaultDuration = true;
  window.setCustomDuration = 3.5;
}

function deactivateAllActions() {
  const { actions } = window;
  actions.forEach(function (action) {
    action?.stop();
  });
}

function pauseAllActions() {
  const { actions } = window;
  actions.forEach(function (action) {
    action && (action.paused = true);
  });
}

function unPauseAllActions() {
  const { actions } = window;
  actions.forEach(function (action) {
    action && (action.paused = false);
  });
}

function AnimationController({ animations, modelRef }: any) {
  const {
    actions: modelRawActions,
    names,
    mixer,
  } = useAnimationCustom(animations, modelRef);

  const { modifyIdleWeight, modifyWalkWeight, modifyRunWeight } = useControls(
    "Blend Weights",
    {
      modifyIdleWeight: 0.0,
      modifyWalkWeight: 1.0,
      modifyRunWeight: 0.0,
    }
  );

  const activateAllActions = useCallback(() => {
    const { idleAction, walkAction, runAction, actions } = window;
    setWeight(idleAction, modifyIdleWeight);
    setWeight(walkAction, modifyWalkWeight);
    setWeight(runAction, modifyRunWeight);
    actions.forEach(function (action) {
      action?.play();
    });
  }, [modifyIdleWeight, modifyRunWeight, modifyWalkWeight]);

  useControls("Activation/Deactivation", {
    deactivateAll: button(deactivateAllActions),
    activateAll: button(activateAllActions),
  });

  useEffect(() => {
    initModel(modelRawActions, names, mixer);
    activateAllActions();
  }, [activateAllActions, modelRawActions, names, mixer]);

  useControls("Pausing/Stepping", {
    pauseOrContinue: button(pauseContinue),
    makeSingleStep: button(toSingleStepMode),
    modifyStepSize: {
      value: 0.05,
      onChange: (v) => (window.modifyStepSize = v),
    },
  });

  useControls("Pausing/Stepping", {
    fromWalkToIdle: button(() => {
      prepareCrossFade(window.walkAction, window.idleAction, 1.0);
    }),
    fromIdleToWalk: button(() => {
      prepareCrossFade(window.idleAction, window.walkAction, 0.5);
    }),
    fromWalkToRun: button(() => {
      prepareCrossFade(window.walkAction, window.runAction, 2.5);
    }),
    fromRunToWalk: button(() => {
      prepareCrossFade(window.runAction, window.walkAction, 5.0);
    }),
    useDefaultDuration: {
      value: true,
      onChange: (v) => (window.useDefaultDuration = v),
    },
    setCustomDuration: {
      value: 3.5,
      onChange: (v) => (window.setCustomDuration = v),
    },
  });

  useControls("General Speed", {
    modifyTimeScale: {
      value: 1.0,
      onChange: (speed) => {
        mixer.timeScale = speed;
      },
    },
  });

  useFrame((_, delta) => {
    let mixerUpdateDelta = delta;
    if (window.singleStepMode) {
      mixerUpdateDelta = window.sizeOfNextStep;
      window.sizeOfNextStep = 0;
    }
    mixer.update(mixerUpdateDelta);
  });

  return null;
}

function Man() {
  const { scene: model, animations } = useGLTF(MODEL_URL);

  const ref = useRef();

  const { showModel, showSkeleton } = useControls("Visibility", {
    showModel: true,
    showSkeleton: false,
  });

  useEffect(() => {
    model.traverse(function (object) {
      if (object.isObject3D) object.castShadow = true;
    });
  }, [model]);

  return (
    <>
      <primitive ref={ref} visible={showModel} object={model} />
      <AnimationController {...{ animations, modelRef: ref }} />
      <skeletonHelper args={[model]} visible={showSkeleton} />
    </>
  );
}
useGLTF.preload(MODEL_URL);

function Plane() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshPhongMaterial depthWrite={false} color="0x999999" />
    </mesh>
  );
}

function Scene() {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    camera.lookAt(0, 1, 0);
    scene.background = new Color(0xa0a0a0);
    scene.fog = new Fog(0xa0a0a0, 10, 50);
    // gl.shadowMap.enabled = true;
  }, [camera, scene]);

  return (
    <>
      <Plane />
      <ModelLoading>
        <Man />
      </ModelLoading>
    </>
  );
}

export default function Page() {
  return (
    <PageCanvas shadows>
      <PerspectiveCamera
        makeDefault
        fov={45}
        far={1000}
        position={[1, 2, -3]}
      />

      <directionalLight
        args={[0xffffff]}
        position={[-3, 10, -10]}
        castShadow={true}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-near={0.1}
        shadow-camera-far={40}
      />
      <hemisphereLight args={[0xffffff, 0x444444]} position={[0, -20, 0]} />
      <Scene />
    </PageCanvas>
  );
}
