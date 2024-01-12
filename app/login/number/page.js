"use client";
import React, { useEffect, useRef, useState } from "react";
import { auth } from "../../../firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Toaster, toast } from "react-hot-toast";
import { AiOutlineReload } from "react-icons/ai";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API } from "@/Essentials";
import { CgSpinner } from "react-icons/cg";
import Link from "next/link";
import Lotties from "@/app/Lotties";
import Image from "next/image";
import bg from "../../assets/Images/bg.png";

function page() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = Array.from({ length: 6 }, () => React.createRef());
  const otpElementRef = useRef(null);
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [OTP, setOTP] = useState();
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [come, setCome] = useState(0);
  const [change, setChange] = useState(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [load, setLoad] = useState(false);
  const [anim, setAnim] = useState(false);

  const handleInputChange = (event, index) => {
    const { value } = event.target;
    setOtp((prevOTP) => {
      const newOTP = [...prevOTP];
      newOTP[index] = value;
      return newOTP;
    });

    if (value === "" && index > 0) {
      otpInputRefs[index - 1].current.focus();
    } else if (value !== "" && index < 5) {
      otpInputRefs[index + 1].current.focus();
    }
  };
  useEffect(() => {
    const finalOTP = otp.join("");
    setOTP(finalOTP);
    const otpElement = otpElementRef.current;

    if (otpElement) {
      otpElement.innerText = finalOTP;

      if (finalOTP.length === 6) {
        otpElement.classList.replace("_notok", "_ok");
      } else {
        otpElement.classList.replace("_ok", "_notok");
      }
    }
  }, [otp]);

  useEffect(() => {
    let interval;

    if (seconds === 0) {
      setSeconds(0);
      setIsActive(true);
      setCome(come + 1);
    }
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
      if (seconds === 0) {
        setSeconds(0);
        setCome(1);
      }
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    onSignup();
    setSeconds(30);
    //setIsActive(!isActive);
  };

  const fetchid = async () => {
    await axios
      .post(`${API}/signup-mobile`, { phone: "91" + number })
      .then(function (res) {
        if (res.data.success === true) {
          if (res.data.userexists) {
            if (window.ReactNativeWebView) {
              let a = JSON.stringify(res?.data);
              window.ReactNativeWebView.postMessage(a);
            }
            toast.success("Success");
          } else {
            if (window.ReactNativeWebView) {
              let data = {
                number: number,
                userexists: false,
                success: true,
              };
              let a = JSON.stringify(data);
              window.ReactNativeWebView.postMessage(a);
            }
            toast.error("Seems like you don't have an account in the app.");
          }
        } else {
          toast.error("Something went wrong...");
          setAnim(false);
        }
      })
      .catch(function (error) {
        console.log(error, "fetchid");
        setAnim(false);
        toast.error("Something went wrong...");
      });
  };

  function onCaptchaVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {
            // Response expired. Ask the user to solve reCAPTCHA again.
            // ...
          },
        }
      );
    }
  }

  function onSignup() {
    setLoading(true);
    onCaptchaVerify();
    setSeconds(30);
    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+91" + number;
    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);

        toast.success("Successfully!");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }

  function onOTPVerify() {
    setLoading(true);
    window.confirmationResult
      .confirm(OTP)
      .then(async (res) => {
        setAnim(true);
        setLoading(false);
        fetchid();
      })
      .catch((err) => {
        console.log(err);
        setAnim(false);
        setLoading(false);
      });
  }

  return (
    <>
      <div className="relative pn:max-sm:w-screen h-screen">
        <div className="absolute pn:max-sm:w-screen border-2 h-full z-10 top-0 left-0 right-0">
          <Image src={bg} alt="image" />
        </div>
        {anim ? (
          <Lotties />
        ) : (
          <>
            {load ? (
              <>
                <div
                  className="fixed inset-0 bg-[#81818117]
             w-full z-20"
                ></div>
                <div className="fixed inset-0 w-full h-screen">
                  <div className="flex justify-center items-center h-[100vh]">
                    <div
                      className="animate-spin text-2xl
      "
                    >
                      <AiOutlineReload />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full">
                <Toaster toastOptions={{ duration: 4000 }} />
                <div id="recaptcha-container"></div>
                {showOTP ? (
                  // OTP
                  <div className=" pt-[120px] w-full z-30 flex flex-col justify-between">
                    <div className="font-bold px-4 z-30 pn:max-sm:text-[30px] text-[22px] text-[#313C58] ">
                      OTP Verification
                    </div>
                    <div className="flex flex-col py-2 px-4 justify-center ">
                      <div className="z-30">
                        We’re sending an SMS to phone number
                      </div>
                      {/* <div className="text-[#96A0AD] pn:max-sm:text-[12px] text-[15px] ">
                        <span className="text-[#0075FF]">+91{number}</span> Wrong
                        Number ?
                      </div> */}
                    </div>

                    <>
                      <div className=" max-w-md w-full flex justify-center gap-2 p-4 py-10">
                        {otp.map((value, index) => (
                          <>
                            <input
                              key={`otp-field-${index}`}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  onOTPVerify();
                                }
                              }}
                              className="otp__digit otp__field md:hidden outline-slate-200 bg-slate-100 vs:h-[50px] vs:w-[50px] w-[45px] h-[45px] rounded-2xl flex justify-center items-center text-center text-[#3e3e3e]"
                              value={value}
                              onChange={(event) =>
                                handleInputChange(event, index)
                              }
                              ref={otpInputRefs[index]}
                              maxLength={1}
                              type="number"
                            />
                          </>
                        ))}
                      </div>
                    </>
                    <div className="text-black font-semibold flex justify-center items-center text-[15px] pt-4">
                      <div className="text-center">
                        {come === 1 ? (
                          <div className="flex gap-4">
                            <div className="text-[#3e3e3e]">
                              Don't receive code ?{" "}
                              <button
                                className={` text-blue-600 rounded ${isActive ? "" : ""
                                  }`}
                                onClick={toggleTimer}
                              >
                                Request Again
                              </button>
                            </div>
                          </div>
                        ) : (
                          <h1
                            className={` ${come === 1
                              ? "hidden "
                              : "text-[16px] text-[#3e3e3e]"
                              }`}
                          >
                            Resend: 00:{seconds}
                          </h1>
                        )}
                      </div>
                    </div>
                    <div className="p-2 flex justify-center items-center w-full">
                      <div
                        onClick={onOTPVerify}
                        className="h-[50px] w-full select-none cursor-pointer bg-black mt-8 flex items-center justify-center rounded-xl text-white"
                      >
                        {loading && (
                          <CgSpinner size={20} className=" animate-spin" />
                        )}
                        <span className={`${loading ? "hidden w-full" : ""}`}>
                          Continue
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Phone
                  <div className="z-20 pt-[120px] w-full bg-white h-screen flex flex-col">
                    <div className="font-bold z-30 px-4 text-left text-[22px] text-[#171717] ">
                      Enter Your Mobile Number
                    </div>
                    {/* <div className="flex flex-col z-30 justify-center items-center  py-2">
                      <div className="text-[#96A0AD] text-[15px] pn:max-sm:text-[12px] text-center px-10">
                        We've missed you! Please sign in to catch up on what
                        you've missed
                      </div>
                    </div> */}

                    {/* phone */}
                    <div
                      className={`${change === 1
                        ? "flex justify-start flex-col p-2 items-start pt-10"
                        : "hidden"
                        }`}
                    >
                      <div className="text-left py-3 font-medium">
                        Mobile Number
                      </div>
                      <div className="bg-[#f7f7f7] w-full flex items-center rounded-xl">
                        <div className="text-[#171717] pl-2">+91</div>
                        <div className="h-[20px] ml-2 border-r-2 border-slate-200" />
                        <input
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              onSignup();
                            }
                          }}
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="Phone no."
                          className="h-[50px] w-[260px] text-[#171717] outline-none bg-[#f7f7f7] rounded-r-2xl px-2 p-2 "
                        />
                      </div>
                    </div>
                    <div
                      className={`${change === 1
                        ? "z-20 flex gap-2 text-[#1F1F1F] text-sm p-2 justify-center items-center"
                        : "hidden"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="bg-[#FF8811] w-6 h-6 text-white"
                      />
                      <div>
                        I have Read and agree to the Terms of Use and
                        acknowledge the Privacy Policy.
                      </div>
                    </div>
                    <div
                      className={`${change === 1
                        ? " py-1 pt-7 px-2 flex justify-center w-full items-center"
                        : "hidden"
                        }`}
                    >
                      <div
                        onClick={onSignup}
                        className="h-[50px] select-none cursor-pointer bg-black w-full flex items-center justify-center rounded-xl text-white "
                      >
                        {loading && (
                          <CgSpinner size={20} className="m-1 animate-spin" />
                        )}
                        <span className={`${loading ? "hidden" : ""}`}>
                          Continue
                        </span>
                      </div>
                    </div>

                    <div className="flex fixed justify-center items-center w-full bottom-10 text-[#414141] gap-4 text-[12px] select-none">
                      <Link href={"../terms"}>T&C</Link>
                      <Link href={"../privacy"}>Privacy</Link>
                      <Link href={"../contact"}>Contact Us</Link>
                      <Link href={"../shipping"}>Shipping</Link>
                      <Link href={"../cancellation"}>Cancellation</Link>
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: "50%" }} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default page;
