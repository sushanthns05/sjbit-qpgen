"use server";

import { adminDb, adminStorage } from "@/lib/firebase-admin";
const pdfParse = require("pdf-parse");
import { v4 as uuidv4 } from "uuid";

export async function uploadAndParseSyllabus(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const subjectCode = formData.get("subjectCode") as string;
    const subjectName = formData.get("subjectName") as string;

    if (!file || !subjectCode || !subjectName) {
      return { success: false, message: "Missing required fields." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload PDF to Firebase Storage
    const fileName = `syllabi/${subjectCode}-${uuidv4()}.pdf`;
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    const [downloadUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '01-01-2099',
    });

    // 2. Parse text from PDF
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    // 3. (TODO) Call AI to structure the syllabus text into Modules and COs
    // For now, we will just save the raw text. In Phase 3, we will use the AI Engine.
    const syllabusDoc = {
      subjectCode,
      subjectName,
      department: "Computer Science", // Default for now
      status: "Draft",
      pdfUrl: downloadUrl,
      rawText,
      uploadedAt: new Date().toISOString(),
      modules: [], // Extracted by AI later
      courseOutcomes: [], // Extracted by AI later
    };

    const docRef = await adminDb.collection("syllabi").add(syllabusDoc);

    return { 
      success: true, 
      message: "Syllabus uploaded and parsed successfully.", 
      id: docRef.id 
    };

  } catch (error) {
    console.error("Failed to upload/parse syllabus:", error);
    return { success: false, message: "Server error processing syllabus." };
  }
}

export async function getSyllabi() {
  try {
    const snapshot = await adminDb.collection("syllabi").orderBy("uploadedAt", "desc").get();
    const syllabi = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: syllabi };
  } catch (error) {
    console.error("Failed to get syllabi:", error);
    return { success: false, message: "Failed to fetch syllabi." };
  }
}
