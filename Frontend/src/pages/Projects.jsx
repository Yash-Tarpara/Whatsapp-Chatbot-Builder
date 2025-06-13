import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import {
  getProjects,
  createProject as createProjectService,
  deleteProject,
} from "../services/projectService";
import { Trash2, PencilIcon, PlusIcon } from "lucide-react";

export default function Projects() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [markedForDeletion, setMarkedForDeletion] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    // console.log("fetch projects called");
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const createProjectPopup = () => {
    setCreateProjectModal(true);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      alert("Project name cannot be empty.");
      return;
    }

    try {
      const data = await createProjectService({ name: newProjectName.trim() });

      setCreateProjectModal(false);
      setNewProjectName("");
      navigate(`/projects/${data._id}`);
    } catch (error) {
      console.error("Error creating project:", error.message);
      alert(error.message);
    }
  };

  const confirmDelete = (project) => {
    setProjectToDelete(project); // store whole project object
    setShowDeleteModal(true);
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectToDelete._id);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      alert(err.message);
    }
    // fetchProjects();
  };

  return (
    <div className="bg-slate-300 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">My Projects</h1>

          <button
            onClick={createProjectPopup}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            <PlusIcon /> Create New Project
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading projects...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-700">No projects yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-slate-200 border border-gray-200 shadow rounded-xl p-6 hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-semibold text-black capitalize mb-1">
                  {project.name}
                </h2>
                <p className="text-xs text-black mb-4">ID: {project._id}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="bg-black text-white text-sm px-4 py-1.5 rounded hover:bg-slate-700 transition-colors duration-200"
                  >
                    <PencilIcon size={18} />
                  </button>

                  <button
                    onClick={() => confirmDelete(project)}
                    className="bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-700 transition-colors duration-200 flex gap-1 items-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && projectToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 animate-scale-in">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{projectToDelete.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {createProjectModal && (
          <div className="animate-slide-in-right fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50 animate-scale-in">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Create New Project
              </h3>
              <p className="text-gray-600 mb-6">
                Enter the name for your new project.
              </p>
              <input
                type="text"
                placeholder="Project Name"
                onChange={(e) => setNewProjectName(e.target.value)}
                value={newProjectName}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring focus:ring-blue-400"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCreateProjectModal(false);
                    setNewProjectName("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
