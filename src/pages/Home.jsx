import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Fade, Slide, Zoom } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import { HashLoader } from "react-spinners";
import SliderHomePage from "../components/SliderHomePage";
import StudySessionsSection from "../components/StudySessionsSection";
import TutorSection from "../components/TutorSection";

const Home = ({ user, isDarkTheme = false }) => {




    return (
        <div className={`${isDarkTheme ? "bg-[#131313] text-white" : "bg-white text-black"} min-h-[100vh] w-full`}>
            <div>

                <SliderHomePage user={user} />

                <div className="mx-auto w-10/12">




                    <StudySessionsSection user={user} />


                    <TutorSection />

                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            </div>
        </div>
    );
};

export default Home;
