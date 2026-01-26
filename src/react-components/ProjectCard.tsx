import * as React from 'react'
import { Project } from '../class/Project'
import { color } from 'three/examples/jsm/nodes/Nodes.js'
import { FrontSide } from 'three'
import { appIcons } from '../globals'

interface Props {
  project: Project
}

export function ProjectCard(props: Props) {
  return (
    <div className="project-card">
      <div className="card-header">
        <p className={`project-icon ${props.project.iconColorClass}`}>
          {props.project.iconInitials}
        </p>
        <div>
          <bim-label style={{color: "white", fontSize: "1rem"}}>{ props.project.name }</bim-label>
          <bim-label>{ props.project.description }</bim-label>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <bim-label icon={appIcons.STATUS} style={{ color: "#969696" }}>Status</bim-label>
          <p>{ props.project.status }</p>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.ROLE} style={{ color: "#969696" }}>Role</bim-label>
          <p>{ props.project.userRole }</p>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.COST} style={{ color: "#969696" }}>Cost</bim-label>
          <p>{ props.project.cost }</p>
        </div>
        <div className="card-property">
          <bim-label icon={appIcons.PROGRESS} style={{ color: "#969696" }}>Estimated Progress</bim-label>
          <p>{props.project.progress }%</p>
        </div>
      </div>
    </div>
  )
}