"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { getAnswer } from "@/scripts/langChain";
import { createWorker } from "tesseract.js";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Upload } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Switch from "@/components/ui/switch"; // Works for both `switch.js` and `switch.tsx`.

const AuroraBackground = ({ children }) => {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute transform-gpu inset-0 bg-gradient-to-r from-violet-400 via-cyan-500 to-emerald-600 opacity-20 blur-3xl animate-aurora" />
        <div className="absolute transform-gpu inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 opacity-20 blur-3xl" style={{ animationDelay: "-1s" }} />
        <div className="absolute transform-gpu inset-0 bg-gradient-to-r from-violet-600 via-cyan-700 to-emerald-500 opacity-20 blur-3xl animate-aurora" style={{ animationDelay: "-1s" }} />
      </div>
      {children}
    </div>
  );
};

const Home = () => {
  const [imageData, setImageData] = useState(null);
  const [progress, setProgress] = useState(100);
  const [progressLabel, setProgressLabel] = useState("idle");
  const [ocrResult, setOcrResult] = useState("");
  const [finalRes, setFinalRes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loader for analysis
  const [isDetailedMode, setIsDetailedMode] = useState(true); // Toggle state

  const workerRef = useRef(null);

  // Initialize OCR worker
  useEffect(() => {
    const initializeWorker = async () => {
      const worker = await createWorker();
      workerRef.current = worker;

      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
    };

    initializeWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const handleExtract = async () => {
    setOcrResult("");
    setFinalRes("");
    if (!workerRef.current || !imageData) return;

    setProgress(0);
    setProgressLabel("Starting OCR...");
    const worker = workerRef.current;

    try {
      const { data } = await worker.recognize(imageData);
      setOcrResult(data.text);
      setProgressLabel("Image Recognization Done");
      handleFinal(data.text);
    } catch (error) {
      setProgressLabel("Error occurred during OCR");
      console.error("OCR error:", error);
    }
  };

  const loadFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadFile(file);
    }
  };

  const handleFinal = async (ocrText) => {
    setIsLoading(true); // Start loader
    try {
      const modePrompt = isDetailedMode
        ? `${ocrText} Provide a **detailed analysis** of the product. Include sodium, carbs, calories (kcal), fats, protein, and any harmful additives. Also, suggest health implications and improvements.`
        : `${ocrText} Summarize the product data in a **quick, simplified format**. Include a short table with key nutrients (sodium, carbs, calories) and clear warnings if needed.`;

      const answer = await getAnswer(modePrompt);
      setFinalRes(answer);
    } catch (error) {
      console.log("An error occurred while fetching the analysis.");
      setFinalRes("Unable to fetch analysis.");
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleSelectNewImage = () => {
    setImageData(null); // Reset image data
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  console.log(ocrResult)

  return (
    <AuroraBackground>
      <div className="min-h-screen relative overflow-hidden">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: { color: { value: "transparent" } },
            particles: {
              number: { value: 50 },
              size: { value: 3 },
              move: { enable: true, speed: 2 },
              color: { value: "#FFFFFF" },
              opacity: { value: 0.5 },
            },
          }}
        />

        

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-center mb-12"
          >
            <div className="container hover:scale-105 transition-all duration-500 hover:shadow-2xl m-16 animated-background bg-gradient-to-r from-blue-400/50 via-blue-600/50 to-indigo-500/50 rounded-3xl mx-auto py-8 backdrop-blur-sm">
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-300 from-sky-400 text-8xl font-semibold font-mono">
                SARAL
              </h1>
            </div>
            <p className="text-gray-100 mt-10 max-w-2xl mx-auto">
              Upload your nutrition label or ingredient list image of packed food and get detailed analysis of its contents, 
              health implications, and recommendations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <BackgroundGradient className="rounded-[22px] p-4 sm:p-10">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {!imageData ? (
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-300">
                        Drag and drop your image here or
                        <label className="text-blue-500 hover:text-blue-400 ml-1 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => loadFile(e.target.files[0])}
                          />
                        </label>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <img
                        src={imageData}
                        alt="Uploaded label"
                        className="max-w-full h-auto rounded-lg"
                      />
                      <Button
                        className="mt-4"
                        variant="secondary"
                        onClick={handleSelectNewImage}
                      >
                        Select New Image
                      </Button>
                    </div>
                  )}
                </div>
              </BackgroundGradient>
            </motion.div>

            {/* Analysis Controls Section */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Analysis Controls</CardTitle>
                  <CardDescription>Extract and analyze the nutrition data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-gray-300 font-medium text-sm">
                      {isDetailedMode ? "Detailed Review" : "Quick Summary"}
                    </label>
                    <Switch
                      checked={isDetailedMode}
                      onChange={() => setIsDetailedMode(!isDetailedMode)}
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      className="w-full bg-white text-black hover:text-white hover:bg-blue-500"
                      variant="secondary"
                      onClick={handleExtract}
                      disabled={!imageData || isLoading}
                    >
                      Extract & Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analysis Result */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-10"
          >
{progress < 100 || progressLabel === "Image Recognization Done" ? (
  <div className="mb-4 space-y-2">
    <div className="flex justify-between text-sm text-gray-400">
      <span>{progressLabel}</span>
      <span>{progressLabel === "Image Recognization Done" ? "100%" : `${progress}%`}</span>
    </div>
    <Progress
      value={progressLabel === "Image Recognization Done" ? 100 : progress}
      className="h-2"
    />
  </div>
) : null}



            {isLoading ? (
              <div className="text-center text-gray-400 mt-10">
                <p>Analyzing your data...</p>
                <div className="loader mt-4 mx-auto w-12 h-12 border-4 border-t-gray-500 border-gray-300 rounded-full animate-spin" />
              </div>
            ) : (
              <MarkdownPreview
                source={finalRes || "Upload an image and click 'Analyze' to get started."}
                className="text-white bg-gray-900 p-4 rounded-md shadow-md"
              />
            )}
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Home;
