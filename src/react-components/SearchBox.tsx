interface Props {
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox(props: Props) {
  return (
    <div style={{ display: 'flex', columnGap: 10 }}>
      <bim-text-input
      debounce="200"
        oninput={(e) => {props.onChange(e.target.value)}}
        placeholder={props.placeholder || "Search..."}
      ></bim-text-input>
    </div>
  );
}