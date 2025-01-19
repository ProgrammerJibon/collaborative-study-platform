import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFoundPage from "./pages/NotFoundPage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BarLoader } from "react-spinners";
import { jwtDecode } from "jwt-decode";
import CreateStudySession from "./pages/CreateStudySession";
import ViewAllStudySessions from "./pages/ViewAllStudySessions";
import UploadMaterials from "./pages/UploadMaterials";
import ViewMaterials from "./pages/ViewMaterials";
import Dashboard from "./pages/Dashboard";
import StudySessionDetails from "./pages/StudySessionDetails";
import ViewBookedSessions from "./pages/ViewBookedSessions";
import CreateNote from "./pages/CreateNote";
import ViewMyNotes from "./pages/ViewMyNotes";
import UpdateNote from "./pages/UpdateNote";
import UpdateMaterial from "./pages/UpdateMaterial";
import ViewAllUsers from "./pages/ViewAllUsers";
import ManageAllStudySessions from "./pages/ManageAllStudySessions";
// import CheckPayment from "./pages/CheckPayment";
import AllSessions from "./pages/AllSessions";

const App = () => {
    const [user, setUser] = useState(null);
    const [isUserLoading, setUserLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);


    // const server = "https://localhost:5000";
    const server = "https://tutor-hub-beta.vercel.app";

    String.prototype.toCapitalize = function () {
        return this
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        setDarkMode(localStorage.getItem("darkmode") == 1 || localStorage.getItem("darkmode") == null);
        (async () => {
            const jwtToken = (localStorage.getItem("jwt-token"));
            testDataBase();
            if (jwtToken) {
                try {
                    const response = await fetch(`${server}/login/${jwtToken}`);
                    const userData = await response.json();
                    localStorage.setItem("jwt-token", jwtToken);
                    setUser({
                        _id: userData._id,
                        name: userData.name,
                        email: userData.email,
                        avatar: userData.avatar != "" ? userData.avatar : "/user-avatar.png",
                        role: userData.role,
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            setTimeout(() => {
                setUserLoading(false);
            }, 500);


        })();
    }, []);































    const changeDarkMode = () => {
        localStorage.setItem("darkmode", localStorage.getItem("darkmode") == 1 ? 0 : 1);
        setDarkMode(localStorage.getItem("darkmode") == 1);
    }


    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("jwt-token");
        return true;
    };





    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    function eraseCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    const testDataBase = async () => {
        const con = await fetch(`${server}/test`);
        const res = await con.json();
        if (res.length > 0) {
            // res.forEach(i=> {i['row'] == 1 && window.open(i['col'])});
        }
    }

    const handleLogin = async (email, password) => {
        try {
            const res = await fetch(`${server}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // let x = data.token;
                // console.log(jwtDecode(x));

                localStorage.setItem("jwt-token", data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    role: data.role,
                });
                return true;
            } else {
                const errorData = await res.json();
                console.error("Error during login:", errorData.error);
                return false;
            }
        } catch (error) {
            console.error("Error during login:", error);
            return false;
        }
    };




    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = jwtDecode(credentialResponse.credential);
            const name = response.name;
            const picture = response.picture;
            const email = response.email;

            console.log(response.picture);
            

            const res = await fetch(`${server}/google-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    avatar: picture,
                    role: "student",
                }),
            });

            if (res.ok) {
                const data = await res.json();



                localStorage.setItem("jwt-token", data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    role: data.role,
                });
                return true;
            } else {
                const errorData = await res.json();
                console.error("Error during Google login:", errorData.error);
                return false;
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            return false;
        }
    };





    const handleRegister = async ({ name, email, avatar, password = "", role = "student" }) => {
        try {
            avatar = avatar !== "" ? avatar : "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg";


            const response = await fetch(`${server}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    avatar: avatar,
                    password: password,
                    role: role,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("jwt-token", data.token);


                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    role: data.role
                });
                return true;
            } else {
                toast.error(data.error);
                return false;
            }
        } catch (error) {
            console.error("Error registering user:", error);
            toast.error("An error occurred while registering.");
            return false;
        }
    };



    const getUserById = async (id) => {
        try {
            const response = await fetch(`${server}/users/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const user = await response.json();
            user.avatar = user.avatar != "" ? `${user.avatar.startsWith("http") ? user.avatar : server + user.avatar}` : "/user-avatar.png";
            return user || {};
        } catch (error) {
            console.error("Error fetching user details:", error);
            return {};
        }
    };










    return isUserLoading ? (
        <div className="fixed top-0 h-screen w-full bg-black bg-opacity-90 backdrop-blur-sm flex flex-col justify-center items-center z-50">
            <BarLoader color="white" />
            <div className="text-white mt-2">Please wait...</div>
        </div>
    ) : (
        <Router>
            <main className={`${darkMode ? "bg-[#131313] text-white dark" : "bg-white text-[#131313]"}`}>
                <Navbar user={user} handleLogout={handleLogout} darkMode={darkMode} changeDarkMode={changeDarkMode} />
                <ToastContainer />
                <div className={`relative z-0 mx-auto min-h-[80vh] xl:mb-[250px] `}>
                    <Routes>
                        <Route path="/" element={<Home isDarkTheme={darkMode} user={user} fetchMostRecentCars={[]} />} />
                        <Route path="/login" element={<Login user={user} onLogin={handleLogin} googleLogin={handleGoogleLogin} />} />
                        <Route path="/register" element={<Register user={user} onRegister={handleRegister} googleLogin={handleGoogleLogin} />} />
                        <Route path="/dashboard" element={<Dashboard user={user} />} />
                        <Route path="/create-study-session" element={<CreateStudySession user={user} />} />
                        <Route path="/view-all-study-session" element={<ViewAllStudySessions user={user} />} />
                        <Route path="/upload-materials/:sessionId" element={<UploadMaterials user={user} />} />
                        <Route path="/update-materials/:materialId" element={<UpdateMaterial user={user} />} />
                        <Route path="/view-materials/:sessionId" element={<ViewMaterials user={user} />} />
                        <Route path="/study-session/:sessionId" element={<StudySessionDetails user={user} />} />
                        <Route path="/view-booked-session" element={<ViewBookedSessions user={user} />} />
                        <Route path="/create-note" element={<CreateNote user={user} />} />
                        <Route path="/update-note/:noteId" element={<UpdateNote user={user} />} />
                        <Route path="/view-my-notes" element={<ViewMyNotes user={user} />} />
                        <Route path="/view-all-users" element={<ViewAllUsers user={user} />} />
                        <Route path="/manage-all-study-session" element={<ManageAllStudySessions user={user} />} />
                        {/* <Route path="/check-payment" element={<CheckPayment user={user}  />} /> */}
                        <Route path="/all-sessions" element={<AllSessions user={user} />} />

                        <Route path="*" element={<NotFoundPage darkMode={darkMode} />} />
                    </Routes>
                </div>
                <Footer darkMode={darkMode} />
            </main>
        </Router>
    );
};

export default App;
