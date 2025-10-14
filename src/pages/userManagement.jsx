
import React, { useState, useEffect } from "react";
import { User, Edit2, Trash2, X, UserPlus, EyeOff, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useConfirm, useNotify } from "../context/ConfirmContext";

export const UserManagement = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [users, setUsers] = useState([]);
  const confirm=useConfirm()
  const notify=useNotify()

  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const password = watch("password");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/gateway/user/get`
      );
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Save or update user
  const saveUser = async (data) => {
    try {
      setLoading(true);

      if (editingUser) {
        // Update
        await axios.put(
          `${process.env.REACT_APP_API_URL}/gateway/user/update/${editingUser.id}`,
          data
        );
        console.log("Updating user:", { ...data, id: editingUser.id });
        notify.success("User credentials updated successfully!")
        setEditingUser(null);
      } else {
        // Create
        await axios.post(
          `${process.env.REACT_APP_API_URL}/gateway/user/register`,
          data
        );
        console.log("Creating new user:", data);
        notify.success("User credentials saved successfully!")
      }

      fetchUsers();
      reset();
    } catch (err) {
      console.error("Error saving user:", err);
      notify.success("Failed to reach servers ")
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    const ok=await confirm("Are you sure you want to delete this user?")
    if(!ok){
      return
    }
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/gateway/user/delete/${id}`
      );
      fetchUsers();
      notify.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      notify.error("Failed to delete user")
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEdit = (user) => {
    setEditingUser(user);
    reset({
      username: user.username,
      email: user.email,
      password: "",
      checkPassword: "",
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            User Management
          </h1>
        </div>

        {/* Add/Edit Form */}
        <form
          onSubmit={handleSubmit(saveUser)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username<span className="text-red-500">*</span>
              </label>
              <input
                {...register("username", { required: "Username is required" })}
                placeholder="Enter username"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
                placeholder="Enter email"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: !editingUser && "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder={
                    editingUser
                      ? "Leave empty to keep current"
                      : "Enter password"
                  }
                  className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("checkPassword", {
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                placeholder={
                  editingUser
                    ? "Leave empty to keep current"
                    : "Re-enter password"
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.checkPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.checkPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-md flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{editingUser ? "Update User" : "Add User"}</span>
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>

        {/* User Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Existing Users
            </h2>
            <p className="text-gray-500 text-sm">
              View and manage all registered users.
            </p>
          </div>

          <div className="p-6">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found. Add your first user above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Username</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.role}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(user)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-700 hover:bg-blue-50 rounded-md"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
