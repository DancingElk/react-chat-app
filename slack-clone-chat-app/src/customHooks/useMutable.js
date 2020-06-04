import { useState, useEffect, useRef } from "react";

export const useMutable = initialValue => {
  const [value, setValue] = useState(initialValue);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
    //console.log(value);
  });

  return {
    ref: valueRef,
    val: value,
    set: setValue
  };
};
