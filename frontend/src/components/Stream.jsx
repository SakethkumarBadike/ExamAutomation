import React, { useState, useEffect } from "react";
import api from "../../axios.config";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore"
import { useNavigate } from "react-router-dom";

const Stream = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isTeacher = user?.role === "T";
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: ""
  });
  const [showForm, setShowForm] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get(`/classrooms/announcements/${id}`);
        setAnnouncementsList(response.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, [id]);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    try {
      const response = await api.post(`/classrooms/announcements/${id}`, {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
      });

      setAnnouncementsList([response.data, ...announcementsList]);
      setNewAnnouncement({ title: "", content: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  useEffect(() => {
    if(!user) {
      navigate("/signin");
    }
  },[user])
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Announcement Section */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Class Announcements</h2>
          {isTeacher && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              {showForm ? "Cancel" : "Add Announcement"}
            </button>
          )}
        </div>

        {/* Add Announcement Form (for teachers) */}
        {isTeacher && showForm && (
          <form onSubmit={handleAddAnnouncement} className="mb-4 border-b pb-4">
            <textarea
              name="title"
              value={newAnnouncement.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full p-2 border rounded mb-2"
              rows="1"
              required
            />
            <textarea
              name="content"
              value={newAnnouncement.content}
              onChange={handleInputChange}
              placeholder="Write your announcement here..."
              className="w-full p-2 border rounded mb-2"
              rows="3"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewAnnouncement({ title: "", content: "" });
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Post Announcement
              </button>
            </div>
          </form>
        )}

        {/* Announcements List */}
        {announcementsList.length > 0 ? (
          announcementsList?.map((announcement) => (
            <div key={announcement.id} className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold">{announcement.title}</h3>
              <p className="text-gray-700 mt-1">{announcement.content}</p>
              <span className="text-gray-500 text-sm">
                - {announcement.creator || "Unknown"}, {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No announcements yet.</p>
        )}
      </div>
    </div>
  );
};

export default Stream;