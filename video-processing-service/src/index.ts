import express from "express"
import ffmpeg from "fluent-ffmpeg"
import { deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setUpDirectories, convertVideo, uploadProcessedVideo} from "./storage";

setUpDirectories();

const app = express();
app.use(express.json());


app.post("/process-video", async (req, res) => {
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Ivalid message payload recieved');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad request: missing file name');
    }
    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    await downloadRawVideo(inputFileName);
    
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        console.error(err);
        return res.status(500).send('Internal server error: Video processing failed')
    }

    await uploadProcessedVideo(outputFileName);
    await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
    return res.status(200).send('Processing finished successfully');
});

const port = process.env.PORT || 3000;
app.listen(port , () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});