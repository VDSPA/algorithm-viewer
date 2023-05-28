import { Tooltip } from "@fluentui/react-components";
import React, { useEffect, useRef, useState } from "react";

interface IProps {
  max: number;
  onChange?: (value: number) => void;
  step?: number;
  marks?: Array<{ label?: string; value: number }>
}

const ProgressBar = (props: IProps) => {

  const [step, setStep] = useState(props.step || 0);
  const originMousePosition = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const stepInDrag = useRef(step);

  useEffect(() => {
    props.step !== undefined && setStep(props.step);
  }, [props.step]);

  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleEndDrag);
    if (thumbRef.current) {
      originMousePosition.current = e.clientX - thumbRef.current.getBoundingClientRect().left;
    }

  };

  const moveThumb = (relativeLeft: number) => {
    if (barRef.current && thumbRef.current) {
      if (relativeLeft < 0) {
        relativeLeft = 0;
      }
      const barWidth = barRef.current.offsetWidth - thumbRef.current.offsetWidth;
      if (relativeLeft > barWidth) {
        relativeLeft = barWidth;
      }
      const patchLength = barWidth / props.max;
      const newStep = Math.ceil(relativeLeft / patchLength);
      if (newStep !== stepInDrag.current) {
        stepInDrag.current = newStep;
        setStep(newStep);
        props.onChange?.(newStep);
      }
    }
  };

  const handleDrag = (e: MouseEvent) => {
    if (barRef.current && thumbRef.current) {
      const offset = e.clientX - originMousePosition.current;
      /** relative to the bar */
      const newLeft = offset - barRef.current.getBoundingClientRect().left;
      moveThumb(newLeft);
    }
  };

  const handleEndDrag = () => {
    document.removeEventListener("mousemove", handleDrag);
  };

  const handleClickBar = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (barRef.current) {
      const newLeft = e.clientX - barRef.current.getBoundingClientRect().left;
      moveThumb(newLeft);
    }
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleEndDrag);
  };

  const handleClickSplitPoint = (step: number) => {
    setStep(step);
    props.onChange?.(step);
  };

  return (
    <div className="relative flex flex-items-center">
      <div
        className="relative flex-auto flex flex-items-center py-1"
        onMouseDown={handleClickBar}
      >
        <div className="
          hover:bg-primary-light
          p-[.2rem]
          absolute
          translate-x-[-50%]
          b-rd-3
          transition-colors
          z-3
        "
        style={{ left: `${(step) / props.max * 100}%`}}
        >
          <div className="b-width-2 bg-primary b-rd-3 w-[.8rem] h-[.8rem]"
            ref={thumbRef}
            onMouseDown={handleStartDrag}
          />
        </div>
        <div
          ref={barRef}
          className="bg-sky-700 h-[.3rem] b-rd-2 flex-auto z-1"
        />
      </div>
      { props.marks?.map(item => (
        <Tooltip
          key={item.value}
          content={item.label || item.value.toString()}
          withArrow relationship="description"
        >
          <div
            className="absolute translate-x-[-50%] w-[.1rem] h-[.3rem] bg-white hover:w-1 transition-all z-2 cursor-pointer"
            style={{ left: `${(item.value) / props.max * 100}%`}}
            onClick={() => handleClickSplitPoint(item.value)}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default ProgressBar;
