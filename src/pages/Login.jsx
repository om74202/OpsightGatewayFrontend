// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const [credentials, setCredentials] = useState({
//     username: "",
//     password: "",
//   });
//   const {login}=useAuth()
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/gateway/user/login`,
//         credentials
//       );
//       console.log(response.data.user);

//       if (response.data?.status === "success") {
//         login({
//           user:response.data.user,
//           token:response.data?.token
//         })        
//         navigate("/gateway"); // redirect after login
//       } else {
//         setError("Login failed");
//       }
//     } catch (err) {
//       console.log(err);
//       setError(err.response?.data?.message || "Something went wrong");
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-white px-4">
//       <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        
//         {/* Logo */}
//         <div className="flex justify-center">
//           <img
//             src="/logo.png" // replace with your logo path
//             alt="Opsight Logo"
//             className="h-12 w-12 rounded-md"
//           />
//         </div>

//         {/* Header */}
//         <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
//           Welcome to OpSight
//         </h2>
//         <p className="mt-1 text-center text-sm text-gray-600">
//           Sign in to access your industrial dashboard
//         </p>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 name="username"
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                 placeholder="Enter your username"
//                 value={credentials.username}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                 placeholder="Enter your password"
//                 value={credentials.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           {error && <p className="text-sm text-red-500">{error}</p>}

//           <button
//             type="submit"
//             className="w-full rounded-md bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
//           >
//             Sign In
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/gateway/user/login`,
        data
      );

      if (response.data?.status === "success") {
        login({
          user: response.data.user,
          token: response.data?.token,
        });
        navigate("/gateway"); // redirect after login
      } else {
        setError("Login failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Opsight Logo"
            className="h-12 w-12 rounded-md"
          />
        </div>

        {/* Header */}
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Welcome to OpSight
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Sign in to access your industrial dashboard
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("username", { required: "Username is required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
