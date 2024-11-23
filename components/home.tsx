"use client"

import { useEffect, useRef, useState } from "react"
import { getAnswer } from "@/scripts/langChain"
import { Button, Group, Image, Progress, Stack, Text } from "@mantine/core"
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { createWorker } from "tesseract.js"
import MarkdownPreview from '@uiw/react-markdown-preview';

const Home = () => {
  const [imageData, setImageData] = useState<null | string>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState("idle")
  const [ocrResult, setOcrResult] = useState("")
  const [finalRes, setFinalRes] = useState("")

  const workerRef = useRef<Tesseract.Worker | null>(null)

  useEffect(() => {
    const initializeWorker = async () => {
      const worker = await createWorker("eng", 1, {
        logger: (message) => {
          if (message.progress !== undefined) {
            setProgress(message.progress)
            setProgressLabel(
              message.progress === 1 ? "Done" : message.status || "Processing"
            )
          }
        },
      })
      workerRef.current = worker
    }

    initializeWorker()

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const handleExtract = async () => {
    setOcrResult("");
    setFinalRes("");
    if (!workerRef.current || !imageData) return

    setProgress(0)
    setProgressLabel("Starting OCR...")
    const worker = workerRef.current

    // Perform OCR
    const { data } = await worker.recognize(imageData)
    setOcrResult(data.text)
    setProgressLabel("Done")
    handleFinal();
  }

  const loadFile = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUri = reader.result
      setImageData(imageDataUri as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFinal = async () => {
    try {
      const answer = await getAnswer(
        ocrResult +
          ` Analyze the given product data to assess its nutritional value. Specifically: Break down the data into macronutrients (e.g., protein, fats, carbohydrates), micronutrients (e.g., vitamins, minerals), and other additives (e.g., preservatives, flavor enhancers). Evaluate whether the product contains excess sugar by comparing its sugar content to standard dietary guidelines (e.g., WHO recommendations). Identify any harmful or potentially harmful ingredients (e.g., trans fats, high levels of sodium, artificial additives linked to health risks). Provide a summary of its overall health impact, including whether it should be consumed in moderation, avoided, or is generally safe. Suggest healthier alternatives if applicable. Input format: Product name: Ingredients: Nutritional facts (per serving): Additional notes or claims (e.g., "organic," "sugar-free"). Output should include a detailed assessment and practical recommendations.`
      )
      setFinalRes(answer);
      console.log(answer);
    } catch (error) {
      console.log(
        "An error occurred while fetching the answer. Please try again."
      )
    }
  }

  return (
    <Group align="initial" style={{ padding: "10px" }}>
      <Stack style={{ flex: "1" }}>
        <Dropzone
          onDrop={(files) => loadFile(files[0])}
          accept={IMAGE_MIME_TYPE}
          multiple={false}
        >
          <Text size="xl" inline>
            Drag image here or click to select file
          </Text>
        </Dropzone>

        {!!imageData && <Image src={imageData} style={{ width: "10%" }} />}
      </Stack>

      <Stack style={{ flex: "1" }}>
        <Button
          disabled={!imageData || !workerRef.current}
          onClick={handleExtract}
        >
          Extract
        </Button>
        <Text>{progressLabel.toUpperCase()}</Text>
        <Progress value={progress * 100} />

        {!!ocrResult && (
          <Stack>
            <Text size="xl">RESULT</Text>
            <Text
              style={{
                fontFamily: "monospace",
                background: "black",
                padding: "10px",
                color: "white",
              }}
            >
              {ocrResult}
            </Text>
          </Stack>
        )}
      </Stack>
      <br />
      <Stack>
        {/* <div>
          <p className="font-bold">Answer:</p>
          <div>{formatText(finalRes)}</div>
        </div> */}
         <MarkdownPreview source={finalRes} style={{ padding: 16 }} />
      </Stack>
    </Group>
  )
}

export default Home
