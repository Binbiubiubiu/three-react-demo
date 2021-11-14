import { Canvas } from "@react-three/fiber";
import { Props } from "@react-three/fiber/dist/declarations/src/web/Canvas";
import { Leva } from "leva";
import { useRouter } from "next/router";
import React from "react";

type PageCanvasProps = Props & React.RefAttributes<HTMLCanvasElement> ;

export const PageCanvas: React.FC<PageCanvasProps> = (props) => {
  const router= useRouter();
  const {hideGUI} = router.query;
  return (
    <div className="full-window">
      <Leva oneLineLabels hideCopyButton hidden={!!hideGUI}/>
      <Canvas dpr={2} {...props}>
        {props.children}
      </Canvas>
    </div>
  );
};
