import * as React from 'react';

interface Props {
  onClick: () => void;
}

export function ProjectEditBtn(props: Props) {
  return (
    <button id="edit-project-btn" className="edit-project-btn" onClick={props.onClick}>
      <span style={{ width: "100%" }}>Edit</span>
    </button>
  );
}