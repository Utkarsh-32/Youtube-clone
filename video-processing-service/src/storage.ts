import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = '1-traffic-video';
const processedVideoBucketName = "1-traffic-processed-video";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/* Creates a local directory for raw and processed videos */
export function setUpDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

export function convertVideo( rawVideoName:string, processedVideoName:string ) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
          .outputOptions("-vf", "scale=-1:720")
          .on("end", () => {
            console.log("Video processing finished successfully");
            resolve();
          })
          .on("error", (err) => {
            console.log(`An error has occurred: ${err.message}`);
            reject(err);
          })
          .save(`${localProcessedVideoPath}/${processedVideoName}`)
    }
    )

}
export async function downloadRawVideo(filename:string) {
  await storage.bucket(rawVideoBucketName)
    .file(filename)
    .download( {destination : `${localRawVideoPath}/${filename}`});
  console.log(
    `gs://${rawVideoBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}`
  )
}

export async function uploadProcessedVideo(fileName:string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName
  });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
  );

  await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName:string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName:string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function deleteFile(filePath:string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      })
    } else {
      console.log(`File not found at ${filePath} skipping the delete`);
      resolve();
    }
  })
}

function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
}