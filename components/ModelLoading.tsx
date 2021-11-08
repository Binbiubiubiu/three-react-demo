import React,{ Suspense } from "react";
import { Html, useProgress } from "@react-three/drei";

function Loading() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

export const ModelLoading:React.FC = (props) =>{
  return <Suspense fallback={<Loading />}>
    {props.children}
  </Suspense>;
}

