import * as React from 'react';

interface Props {
  onClick: () => void;
}

export function ToDoAdd(props: Props) {
  const handleClick = () => {
    console.log("Add To-Do clicked")
    props.onClick()
  }

  return (
    <span 
      id="ToDoAdd-Btn" 
      className="material-symbols-rounded"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      add
    </span>
  );
}