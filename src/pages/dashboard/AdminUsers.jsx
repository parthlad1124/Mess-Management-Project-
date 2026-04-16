import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [editId, setEditId] = useState(null);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Create / Update
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editId) {
      await axiosClient.put(`/admin/users/${editId}`, {
        fullName: form.fullName,
        email: form.email,
        role: form.role,
      });
      toast.success("User updated successfully");
    } else {
      await axiosClient.post("/admin/users", form);
      toast.success("User created successfully");
    }

    setForm({ fullName: "", email: "", password: "", role: "Student" });
    setEditId(null);
    fetchUsers();
  } catch (err) {
    toast.error("Something went wrong");
    console.error(err);
  }
};

  // 🔹 Edit user
 const handleEdit = (user) => {
  setForm({
    fullName: user.fullName,
    email: user.email,
    password: "",
    role: user.role,
  });
  setEditId(user.id);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  // 🔹 Delete user
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");

  if (!confirmDelete) return;

  try {
    await axiosClient.delete(`/admin/users/${id}`);
    toast.success("User deleted successfully");
    fetchUsers();
  } catch (err) {
    toast.error("Delete failed");
    console.error(err);
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {/* FORM */}

      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-4 mb-6 grid grid-cols-2 gap-4"
        
      >
        <input
          autoComplete="off"
          className="border p-2 rounded"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          autoComplete="new-email"
          className="border p-2 rounded"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {!editId && (
          <input
            autoComplete="new-password"
            className="border p-2 rounded"
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        )}

        <select
          className="border p-2 rounded"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
        </select>

        <button className="bg-blue-500 text-white p-2 rounded col-span-2">
          {editId ? "Update User" : "Add User"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full bg-white shadow rounded-xl">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="text-center border-t">
              <td className="p-2">{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>

              <td className="space-x-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}