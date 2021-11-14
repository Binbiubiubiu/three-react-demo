import { Canvas } from "@react-three/fiber";
import { Props } from "@react-three/fiber/dist/declarations/src/web/Canvas";
import { Leva } from "leva";
import React from "react";

type PageCanvasProps = Props & React.RefAttributes<HTMLCanvasElement> ;

export const PageCanvas: React.FC<PageCanvasProps> = (props) => {
  return (
    <div className="full-window">
      <Leva oneLineLabels hideCopyButton />
      <Canvas dpr={2} {...props}>
        {props.children}
      </Canvas>
    </div>
  );
};
