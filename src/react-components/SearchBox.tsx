import * as React from 'react';

interface Props {
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox(props: Props) {
  return (
    <div style={{ display: 'flex', columnGap: 10 }}>
      <input
        onChange={(e) => {props.onChange(e.target.value)}}
        type="text"
        placeholder={props.placeholder || "Search..."}
        style={{ width: "100%", height: "20px", backgroundColor: "var(--background-200)" }}  
      />
    </div>
  );
}