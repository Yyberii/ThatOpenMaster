import * as React from 'react';
import * as Router from 'react-router-dom';

export function Sidebar() {
  return (
    <aside id="sidebar">
      <img id="company-logo" src="/assets/logo.svg" alt="Construction company" />
        <ul id="nav-buttons">
          <Router.Link to="/">
          <li id="projects-nav-btn"><span className="material-symbols-rounded">apartment</span>Projects</li>
          </Router.Link>
          <li><span className="material-symbols-rounded">account_circle</span>Users</li>
        </ul>
    </aside>
  )
}