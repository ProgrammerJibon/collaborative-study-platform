import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaIdCard } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { TbCameraSelfie } from "react-icons/tb";
import { RiLockPasswordFill } from "react-icons/ri";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import googleCloudSecret from "../.env/client_secret_497545261562-ttr9shqeltjmlejplljunb9qciaf42h5.apps.googleusercontent.com.json";
import { HashLoader } from "react-spinners";
import GitHubLogin from 'react-github-login';
import githubAuthData from "../.env/github_secret_0355189afeefe7b995af682d9d762b02ebfb7ae0.json";

const Register = ({ user, onRegister, googleLogin, githubLogin }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setavatar] = useState("");
    const [role, setrole] = useState("student");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const next = searchParams.get("next");

    useEffect(() => {
        if (user) {
            if (next != null) {
                navigate(next);
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
            toast.error(
                "Password must be at least 6 characters long, with at least one uppercase and one lowercase letter."
            );
            return;
        }
        setIsRegistering(true);
        const success = await onRegister({ name, email, avatar, password, role });
        setIsRegistering(false);
        if (success) {
            toast.success("Registered successfully!");
            navigate("/");
        } else {
            toast.error("Registration failed. Please try again.");
        }
    };


    const onGithubSuccess = async response => {
        setIsRegistering(true);
        if ("code" in response) {
            await githubLogin(response.code, githubAuthData.clientId, githubAuthData.secret);
        }
        setIsRegistering(false);
    };

    const onGoogleSuccess = async credentialResponse => {
        setIsRegistering(true);
        await googleLogin(credentialResponse);
        setIsRegistering(false);
    };
    const onFailure = response => {
        setIsRegistering(false);
    };


    return (
        <div className="py-12 px-6 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
            <form onSubmit={handleRegister} className="bg-white dark:bg-black dark:bg-opacity-50 p-6 rounded shadow">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">
                        <FaIdCard /> Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-orange-700"
                        placeholder="Enter your name"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">
                        <MdOutlineAlternateEmail /> Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-orange-700"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="avatar" className="block text-sm font-semibold mb-2">
                        <TbCameraSelfie /> Photo URL (Optional)
                    </label>
                    <input
                        type="url"
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setavatar(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-orange-700"
                        placeholder="Enter your photo URL"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="avatar" className="block text-sm font-semibold mb-2">
                        <TbCameraSelfie /> Role
                    </label>
                    <select
                        value={role}
                        defaultValue={"student"}
                        onChange={(e) => {
                            setrole(e.target.value);
                            if (e.target.value == "admin") {
                                toast.warning("Admin is available only for test purpose by examineer.")
                            }
                        }}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-orange-700"
                        placeholder="Enter your photo URL"
                    >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-semibold mb-2">
                        <RiLockPasswordFill /> Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-orange-700"
                            placeholder="Enter your password"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                        >
                            {showPassword ? <VscEyeClosed /> : <VscEye />}
                        </span>
                    </div>
                </div>
                {isRegistering ? <div className="flex justify-center items-center">
                    <HashLoader color="yellow" />
                </div>
                    :
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-orange-600 text-white p-3 rounded font-semibold hover:bg-orange-700"
                        >
                            Register
                        </button>
                        <div className="text-center mt-6 space-y-4 px-6 mb-6">
                            <div>or</div>
                            <GitHubLogin
                                clientId={githubAuthData.clientId}
                                redirectUri={window.location.origin}
                                onSuccess={onGithubSuccess}
                                onFailure={onFailure}
                                className="w-full "
                                onRequest={()=>{
                                    setIsRegistering(true);
                                }}

                                
                            >
                                <div className="py-2 px-4  flex justify-center items-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg">
                                    <span>Sign in with GitHub</span>
                                </div>
                            </GitHubLogin>
                            <GoogleOAuthProvider clientId={googleCloudSecret.web.client_id}>
                                <div className="mx-auto overflow-hidden w-max-[400px] pb-4 google-btn">
                                    <GoogleLogin
                                        onSuccess={onGoogleSuccess}
                                        onError={() => {
                                            // // console.log("Login Failed");
                                        }}
                                        width="420px"
                                    />
                                </div>
                            </GoogleOAuthProvider>
                            <p className="text-sm">
                                Already have an account?{" "}
                                <Link to={"/login" + (next ? "?next=" + encodeURIComponent(next) : "")} className="text-orange-600 hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                }
            </form>


        </div>
    );
};

export default Register;
