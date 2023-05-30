interface IProps {
  keys: string[];
  label: string
  reverse?: boolean
}

const KeyboardLabel = (props: IProps) => {
  const { keys, label, reverse = false } = props;
  return (
    <div className="flex gap-2">
      <div className="flex gap-[.1rem] flex-items-baseline"
        style={{ flexDirection: reverse ? "row-reverse": "unset" }}
      >
        <div>
          { keys.map((key, index) => (
            <kbd
              className="text-[.6rem] px-1 py-[.15rem] bg-gray-100 mx-[.2rem] lh-none
                b-solid b-b-3 b-gray-300 b-rd-1
                c-gray-400
              "
              key={`${key}-${index}`}
            >
              { key }
            </kbd>
          ))}
        </div>
        <span className="c-gray-500 fw-500 lh-none">{ label }</span>
      </div>
    </div>
  );

};

export default KeyboardLabel;
