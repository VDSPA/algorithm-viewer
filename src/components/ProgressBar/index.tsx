import { useRef, useState } from "react";

interface IProps {
  max: number;
  onChange?: (value: number) => void;
  defaultStep?: number;
  marks?: number[];
}

const ProgressBar = (props: IProps) => {

  const [step, setStep] = useState(props.defaultStep || 0);
  const originMousePosition = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const stepInDrag = useRef(step);

  const handleStartDrag = (e: MouseEvent) => {
    e.preventDefault();
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
    document.removeEventListener("mouseup", handleEndDrag);
  };

  const handleClickBar = (e: MouseEvent) => {
    e.preventDefault();
    if (barRef.current) {
      const newLeft = e.clientX - barRef.current.getBoundingClientRect().left;
      moveThumb(newLeft);
    }
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleEndDrag);
  };

  return (
    <section className="relative flex flex-items-center gap-4">
      <div className={
        `w-6 h-6 b-rd-6 bg-white b-solid 
          absolute box-border
          translate-x-[-.75rem]
        `}
        style={{ left: `${step / props.max * 100}%`}}
        ref={thumbRef}
        onMouseDown={handleStartDrag}
      />
      <div
        ref={barRef}
        className="bg-blue h-3 b-rd-2 flex-auto"
        onMouseDown={handleClickBar}
      />
    </section>
  );
};

export default ProgressBar;
