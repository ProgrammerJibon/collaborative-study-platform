import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import googleCloudSecret from "../.env/client_secret_497545261562-ttr9shqeltjmlejplljunb9qciaf42h5.apps.googleusercontent.com.json";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { HashLoader } from "react-spinners";

const Login = ({ onLogin, googleLogin, user }) => {
    const [email, setEmail] = useState("admin@jibon.com.bd");
    const [password, setPassword] = useState("Aa1234");
    const [isLogging, setIsLogging] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get("next");

    useEffect(() => {
        if (user) {
            toast.success("Logged in successfully!");
            if (next != null) {
                navigate(next);
            } else {
                navigate("/");
            }
        }
    }, [user, next, navigate]);
    

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }
        setIsLogging(true);
        const success = await onLogin(email, password);
        setIsLogging(false);
        if (!success) {
            toast.error("Invalid email or password.");
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    return (
        <div className="py-12 px-6 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
            <form onSubmit={handleLogin} className="dark:bg-black dark:bg-opacity-50 bg-white p-6 rounded shadow">
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
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-3 text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <VscEyeClosed /> : <VscEye />}
                        </button>
                    </div>
                </div>
                {isLogging?
                <div className="flex justify-center items-center">
                    <HashLoader color="yellow"/>
                </div>
                :
                <button
                    type="submit"
                    className="w-full bg-orange-600 text-white p-3 rounded font-semibold hover:bg-orange-700"
                >
                    Login
                </button>}
            </form>

            {!isLogging && <div className="text-center mt-6 space-y-4 px-6 mb-6">
                <div>or</div>
                <GoogleOAuthProvider clientId={googleCloudSecret.web.client_id}>
                    <div className="mx-auto w-full overflow-hidden w-max-[400px] pb-4 google-btn">
                        <GoogleLogin
                            onSuccess={googleLogin}
                            onError={() => {
                                // console.log("Login Failed");
                            }}
                            width="420px"
                        />
                    </div>
                </GoogleOAuthProvider>
                <p className="text-sm">
                    Don't have an account?{" "}
                    <Link
                        to={"/register" + (next ? "?next=" + encodeURIComponent(next) : "")}
                        className="text-orange-600 hover:underline"
                    >
                        Register here
                    </Link>
                </p>
            </div>}
        </div>
    );
};

export default Login;
