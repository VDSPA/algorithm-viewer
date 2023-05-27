import React, { useEffect, useRef, useState } from "react";

interface IProps {
  max: number;
  onChange?: (value: number) => void;
  step?: number;
  marks?: number[];
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

  return (
    <div
      className="relative flex-auto flex flex-items-center py-1"
      onMouseDown={handleClickBar}
    >
      <div className="
        hover:bg-primary-light
        p-[.2rem]
        absolute
        translate-x-[-.75rem]
        b-rd-3
        transition-colors
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
        className="bg-sky-700 h-[.3rem] b-rd-2 flex-auto"
      />
    </div>
  );
};

export default ProgressBar;
