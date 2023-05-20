import useSWR from "swr";
import { useRef } from "react";

type ReturnType = [
  setting: GraphAPI.Setting,
  setSetting: (setting: GraphAPI.Setting) => void,
]

type PropsType = GraphAPI.Setting;

export default function useSetting(props?: PropsType): ReturnType {
  const initialValue = useRef<GraphAPI.Setting>(props || {
    isDirected: true,
  });

  const { mutate, data } = useSWR("/store/setting", () => initialValue.current);

  return [
    data as GraphAPI.Setting,
    mutate,
  ];

}
