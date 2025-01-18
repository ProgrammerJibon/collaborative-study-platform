import { GrNext, GrPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Slide, Zoom } from "react-slideshow-image"

export default ({ user }) => {

    const slideImages = [
        {
            url: "https://previews.123rf.com/images/maevskaya/maevskaya2111/maevskaya211100006/176876378-doodle-set-hand-drawn-elements-for-diary-notebook-and-planner-vector-calendar-for-study-and-work.jpg",
            title: `Welcome ${user ? "back " + user.name : ""} to Tutors Hub`,
            desc: "Train Your Brain Today!",
        },
        {
            url: "https://previews.123rf.com/images/ellagrin/ellagrin1704/ellagrin170400002/75888788-concept-study-business-problems-and-its-analysis-research-analysis-doodle-set-background.jpg",
            title: "Get the best tutors over Bangladesh"
        },
        {
            url: "https://static.vecteezy.com/system/resources/previews/005/676/797/non_2x/maths-symbols-icon-set-algebra-or-mathematics-subject-doodle-design-education-and-study-concept-back-to-school-background-for-notebook-not-pad-sketchbook-hand-drawn-illustration-vector.jpg",
            title: "We've the best math teachers"
        },
    ];




    return <section className="slide-container">
        <Slide
            prevArrow={
                <button
                    style={{
                        position: "absolute",
                        left: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        padding: "20px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                >
                    <GrPrevious />
                </button>
            }
            nextArrow={
                <button
                    style={{
                        position: "absolute",
                        right: "20px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        padding: "20px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                    }}
                >
                    <GrNext />
                </button>
            }
            duration={1000}
            cssClass={"bg-black"}
        >
            {slideImages.map((slideImage, index) => (
                <div key={index} className="text-center -z-10 relative select-none">
                    <div
                        style={{
                            backgroundImage: `url(${slideImage.url})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            height: "400px"
                        }}
                    >
                        <div
                            className={`w-full h-full flex flex-col items-center justify-center dark:bg-[#131313] dark:bg-opacity-75 bg-white bg-opacity-50 backdrop-blur-sm dark:text-white text-gray-800`}
                        >
                            <div className="text-4xl font-bold animate__animated animate__bounce">{slideImage.title}</div>
                            {slideImage?.desc !== "" && slideImage?.desc !== undefined && (
                                <div className="py-4">{slideImage.desc}</div>
                            )}
                            {slideImage?.btnName !== "" && slideImage?.btnName !== undefined && (
                                <Link
                                    to={slideImage.btnLink}
                                    className={`dark:bg-[#2e2e2e] bg-gray-500 mt-4 text-white px-6 py-2 rounded font-semibold bg-opacity-25 backdrop-blur-[1px] hover:backdrop-blur-[5px]`}
                                >
                                    {slideImage.btnName}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </Slide>
    </section>
}