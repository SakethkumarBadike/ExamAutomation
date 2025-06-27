import { useState, useEffect, useRef } from 'react';

const Instructions = ({ setShowInstructions, testData,setStream,stream}) => {
    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    

    const requestCameraPermission = async () => {
        try {
            setCameraError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user" // Front camera
                },
                audio: false
            });
            // console.log(mediaStream)
            setStream(mediaStream);
            if (videoRef.current) {
                console.log('Setting video source to media stream');
                videoRef.current.srcObject = mediaStream;
                // Add event listener to check if video is actually playing
                videoRef.current.onloadedmetadata = () => {
                    console.log('Video metadata loaded');
                };
                videoRef.current.onplay = () => {
                    console.log('Video started playing');
                };
                videoRef.current.onerror = (e) => {
                    console.error('Video error:', e);
                    setCameraError('Failed to display video feed');
                };
            }
            
            setCameraAllowed(true);
        } catch (err) {
            console.error("Camera access denied:", err);
            setCameraError("Camera access is required to continue with the test.");
            alert("Camera access is required to continue with the test.");
        }
    };

   

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Test Instructions
            </h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{testData.title}</h2>
                <div className="prose max-w-none text-gray-600">
                    <p className="mb-4">Duration: {testData.duration} minutes</p>
                    <p className="mb-4">Total Questions: {testData.test_questions?.length || 0}</p>
                    <p className="mb-4">Maximum Marks: {testData.total_marks}</p>
                    
                    <h3 className="font-medium mt-6 mb-2 text-gray-800">Important Instructions:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Do not refresh the page during the test</li>
                        <li>Do not switch tabs or minimize the browser window</li>
                        <li>The test will auto-submit when time expires</li>
                        <li>You have limited attempts to leave the test window</li>
                        <li>All questions are mandatory</li>
                    </ul>
                </div>
            </div>

            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-bold text-lg mb-3 text-yellow-800">Camera Setup</h3>
                <p className="mb-4 text-yellow-700">
                    You need to enable camera access for proctoring during the test.
                </p>
                {cameraError && (
                    <div className="text-red-600 mb-4">
                        <strong>Error:</strong> {cameraError}

                    </div>
                )}  
                    <button
                        onClick={requestCameraPermission}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        hidden={cameraAllowed}
                    >
                        Allow Camera Access
                    </button>
             
                    <div className="flex flex-col items-center gap-4" hidden={!cameraAllowed}>
                        <div className="relative w-full max-w-md h-64 border-2 border-green-500 rounded-lg overflow-hidden bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }} // Mirror the video
                            />
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Camera Active
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-green-600 font-medium">
                                ✓ Camera access granted
                            </span>
                            {stream && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {stream.getVideoTracks()[0]?.label || 'Camera feed active'}
                                </p>
                            )}
                        </div>
                    </div>
                
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => setShowInstructions(false)}
                    disabled={!cameraAllowed}
                    className={`px-8 py-3 rounded-lg font-bold text-lg ${
                        cameraAllowed 
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Start Test
                </button>
            </div>
        </div>
    );
};

export default Instructions;