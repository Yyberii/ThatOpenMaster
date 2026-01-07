import * as React from 'react';
import { Project } from '../class/Project';

interface Props {
  project: Project;
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export function ProjectEditPage(props: Props) {
  const [formData, setFormData] = React.useState({
    name: props.project.name,
    description: props.project.description,
    status: props.project.status,
    cost: props.project.cost,
    userRole: props.project.userRole,
    finishDate: props.project.finishDate.toISOString().split('T')[0],
    progress: props.project.progress,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    props.onSave(formData)
  }

  return (
    <div className="page" id="project-edit-page">
      <header>
        <h2>Edit {props.project.name}</h2>
      </header>
      <div className="main-page-content">
        <form id="edit-modal-content" style={{ maxWidth: 600 }}>
          <div style={{ padding: "0 30px" }}>
            <div className="form-field-container">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
              <textarea
                name="description"
                cols={30}
                rows={4}
                style={{ marginTop: 10 }}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              columnGap: 30,
              rowGap: 20,
              padding: "30px 0px",
              justifyContent: "space-between"
            }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Status</p>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%" }}>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Cost</p>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Role</p>
                <select name="userRole" value={formData.userRole} onChange={handleChange} style={{ width: "100%" }}>
                  <option value="Architect">Architect</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Finish Date</p>
                <input
                  type="date"
                  name="finishDate"
                  value={formData.finishDate}
                  onChange={handleChange}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div>
              <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>Progress</p>
              <input
                type="number"
                name="progress"
                min={0}
                max={100}
                value={formData.progress}
                onChange={handleChange}
                style={{ width: 60, padding: 5, textAlign: "center" }}
              />
            </div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "20px 30px"
          }}>
            <button
              type="button"
              onClick={props.onCancel}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgb(200, 50, 50)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(50, 200, 95, 1)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}