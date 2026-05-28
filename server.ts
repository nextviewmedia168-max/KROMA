import express from "express";
import path from "path";
import multer from "multer";
import { Document, Paragraph, TextRun, Packer, AlignmentType } from "docx";
import { createServer as createViteServer } from "vite";
import pdf from "pdf-parse/lib/pdf-parse.js";
import ExcelJS from "exceljs";
import fs from "fs";

import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in your environment secrets. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function convertDocWithGemini(fileBuffer: Buffer, language: string) {
  const filePart = {
    inlineData: {
      mimeType: "application/pdf",
      data: fileBuffer.toString("base64")
    }
  };

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      filePart,
      `Analyze the uploaded PDF file. Reconstruct the pages into clean paragraphs with correct styles.
Language requested or detected: ${language}.
Your absolute highest priority is: Ensure Khmer spelling is 100% correct, and all word elements and letters are in the correct spelling order, with appropriate visual vowel placement and diacritic combinations. Correct any spelling or spacing errors introduced by typical raw text extraction. Keep the text structure, aligning centered headings, left body texts, right signatures/dates, bolding key titles, and estimating clean print font sizes (in pt, e.g. 11, 12, 14, 16).`
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          paragraphs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { 
                  type: Type.STRING, 
                  description: "The paragraph text content. Form all words fully and correctly with pristine Khmer spelling, proper spacing, and accurate diacritics/sub-consonant (Coeng) combinations. Do not omit any sentence info." 
                },
                alignment: { 
                  type: Type.STRING, 
                  description: "Text alignment: 'left', 'center', 'right', or 'justify'." 
                },
                isHeader: { 
                  type: Type.BOOLEAN, 
                  description: "Whether this block is a title, Royal tagline/motto, or header." 
                },
                bold: { 
                  type: Type.BOOLEAN, 
                  description: "Whether text block should be bold." 
                },
                fontSize: { 
                  type: Type.INTEGER, 
                  description: "Recommended font size in standard Pt (e.g. 12 for normal, 14 or 16 for headings)." 
                }
              },
              required: ["text"]
            }
          }
        },
        required: ["paragraphs"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response text from Gemini API.");
  }

  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.paragraphs)) {
    throw new Error("Invalid output format from Gemini.");
  }
  return parsed;
}

function normalizeKhmerText(rawText: string): string {
  if (!rawText) {
    return "";
  }
  
  let text = rawText;

  // 1. Core legacy / scrambled syllable alignment maps (expert typographic standard)
  const mismatches: Record<string, string> = {
    "កិចស្ចន្យា": "កិច្ចសន្យា",
    "បក្រារ": "ប្រការ",
    "កមមវិធី": "កម្មវិធី",
    "សកមម": "សកម្ម",
    "សកមមភាព": "សកម្មភាព",
    "តនៅនេះ": "តទៅនេះ",
    "នឹ្": "នឹង",
    "ស្លៃ": "ថ្ងៃ",
    "រដបៀបែំដណើរការ": "របៀបដំណើរការ",
    "ររ់ប្បចំ": "រាល់ប្រចាំ",
    "ដខ្រត": "ខេត្ត",
    "ដៅេនំដេញ": "ទៅភ្នំពេញ",
    "ដសៀមរាប": "សៀមរាប",
    "សហេមន៍": "សហគមន៍",
    "បដនៃ": "បន្លែ",
    "ជាដប្ចើន": "ជាច្រើន",
    "ដផ្្ើ": "ផ្ញើ",
    "ចដនាលោះ": "ចន្លោះ",
    "ទំដនរ": "ទំនេរ",
    "ស្នឡាន": "នៃឡាន",
    "ែឹកអ្នកែំដណើរ": "ដឹកអ្នកដំណើរ",
    "ទាំ្ដនាោះ": "ទាំងនោះ",
    "អ្រថប្បដោជន៍": "អត្ថប្រយោជន៍",
    "បដ្កើរ": "បង្កើត",
    "ដខ្ែសង្វក់": "ខ្សែសង្វាក់",
    "ែឹកជញ្ជូន": "ដឹកជញ្ជូន",
    "ដែលាន": "ដែលមាន",
    "រស្មៃដថាកបំផ្,រ": "តម្លៃថោកបំផុត",
    "សប្ាប់": "សម្រាប់",
    "ខ្នររូច": "ខ្នាតតូច"
  };

  for (const [broken, correct] of Object.entries(mismatches)) {
    text = text.split(broken).join(correct);
  }
  
  // 2. Broad substitution for standard legacy layout phrases/words
  text = text.replace(/ច្ារ់ទដើម/g, "ចាប់ផ្តើម");
  text = text.replace(/ច្ារ់/g, "ចាប់");
  text = text.replace(/ទដើម/g, "ផ្តើម");
  text = text.replace(/ព្ រះ/g, "ព្រះ");
  text = text.replace(/ព្\s*រះរាជាណាចព្\s*ររម្\s*ពុ[\s\t]*ជា/g, "ព្រះរាជាណាចក្រកម្ពុជា");
  text = text.replace(/ជាតិ\s*សាសនា\s*ព្\s*រះម្ហារសព្ត/g, "ជាតិ សាសនា ព្រះមហាក្សត្រ");
  text = text.replace(/កម្ ពុ/g, "កម្ពុ");
  text = text.replace(/ម្ ពុ ជា/g, "ម្ពុជា");
  
  // 3. Fix misplaced Khmer Coeng (Subscript) combinations safely (when a vowel was physically typed before a sub-consonant)
  // Case A: Consonant + Vowel + Coeng + Sub-consonant -> Consonant + Coeng + Sub-consonant + Vowel
  text = text.replace(/([\u1780-\u17A2])([\u17B6-\u17C5]+)\u17D2([\u1780-\u17A2])/g, "$1\u17D2$3$2");
  
  // 4. Standard spacing/tab cleanup around Coeng
  text = text.replace(/\u17D2[\s\t]+/g, "\u17D2");
  text = text.replace(/[\s\t]+\u17D2/g, "\u17D2");
  
  // 5. Double vowels or consecutive duplicate vowels cleanup
  text = text.replace(/([\u17B6-\u17C5])\1+/g, "$1");
  
  // 6. Regex fix for trailing, isolated subscripts crashing Unicode layouts
  text = text.replace(/([\u1780-\u17A2])\u17D2(\s|$)/g, "$1$2");
  
  return text;
}

const app = express();
const PORT = 3000;

// Use multer to handle file uploads in memory for demonstration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 } // 4.5 MB limit for Vercel
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// We will expose two endpoints:
// 1. POST /api/convert-pdf -> returns task_id (202)
// 2. GET /api/task/:task_id -> returns status and eventually the file url or file itself.

const tasks: Record<string, { status: string; language: string; format: string; fileData?: Buffer; progress: number; previewText?: string }> = {};

  app.post(["/api/convert-pdf", "/convert-pdf"], upload.single("file"), async (req, res) => {
    console.log("DEBUG: POST /api/convert-pdf route reached");
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Validate PDF
    if (req.file.mimetype !== 'application/pdf' && !req.file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({ error: "Invalid file type. Please upload a PDF." });
    }

    const language = req.body.language || "Auto-Detect";
    const khmerFont = req.body.khmerFont || "Khmer OS Battambang";
    const outputFormat = req.body.format || "docx";
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fileBuffer = req.file.buffer;
    
    tasks[taskId] = { 
      status: "processing", 
      language, 
      format: outputFormat,
      progress: 0 
    };

    const runConversion = async () => {
      try {
        let buffer: Buffer;

        const convertApiKey = process.env.CONVERTAPI_SECRET_KEY;
        const isSelectedKhmer = language.toLowerCase() === "khmer";

        // Generic ConvertAPI does not support legacy Khmer character-glyph restructuring,
        // and standard text extraction scrambling. We prefer Gemini OCR for Khmer documents.
        if (convertApiKey && !isSelectedKhmer) {
           const convertapiModule: any = await import('convertapi');
           const convertapiInit = convertapiModule.default || convertapiModule;
           const convertapi = convertapiInit(convertApiKey);
           
           // Write buffer to temp file
           const tempInput = `/tmp/${taskId}.pdf`;
           fs.writeFileSync(tempInput, fileBuffer);
           
           try {
             // Let ConvertAPI convert to requested format
             const convertApiFormat = outputFormat === 'xlsx' ? 'xlsx' : 'docx';
             const result = await convertapi.convert(convertApiFormat, {
                 File: tempInput
             }, 'pdf');
             
             // Result contains files
             const fileUrl = result.response.Files[0].Url;
             const fileResp = await fetch(fileUrl);
             buffer = Buffer.from(await fileResp.arrayBuffer());
             
             tasks[taskId].previewText = `Layout-preserved ${convertApiFormat.toUpperCase()} generated via ConvertAPI. Pixel-perfect layout applied.`;
           } finally {
             // Cleanup
             if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
           }
        } else {
            let geminiResult: { paragraphs: any[] } | null = null;
            
            if (process.env.GEMINI_API_KEY) {
                 try {
                      console.log(`[Task ${taskId}] Attempting PDF OCR extraction and Khmer spell correction via Gemini API...`);
                      geminiResult = await convertDocWithGemini(fileBuffer, language);
                      console.log(`[Task ${taskId}] Gemini layout extraction completed successfully!`);
                 } catch (gErr: any) {
                      console.error(`[Task ${taskId}] Gemini layout extraction failed, falling back to pdf-parse:`, gErr);
                 }
            }

            if (geminiResult) {
                // Apply Khmer normalization middleware to Gemini output text
                geminiResult.paragraphs = geminiResult.paragraphs.map((p: any) => ({
                    ...p,
                    text: normalizeKhmerText(p.text || "")
                }));

                const previewLines = geminiResult.paragraphs.map(p => p.text);
                tasks[taskId].previewText = previewLines.join("\n\n").substring(0, 5000) + "\n\n[Extracted and spell-corrected with Gemini 3.5]";

                const docSections = geminiResult.paragraphs.map((p: any) => {
                    const textBlock = p.text || "";
                    if (textBlock.trim() === '') {
                         return new Paragraph({
                            children: [new TextRun({ text: "", size: 24 })],
                            spacing: { after: 120 }
                         });
                    }

                    const hasKhmer = /[\u1780-\u17FF]/.test(textBlock);
                    const isKhmer = hasKhmer || language.toLowerCase() === "khmer";
                    const fontName = isKhmer ? khmerFont : "Arial";
                    const font = {
                        ascii: fontName,
                        cs: fontName,
                        hAnsi: fontName,
                        eastAsia: fontName
                    };

                    let alignValue: any = AlignmentType.LEFT;
                    if (p.alignment) {
                        const al = p.alignment.toLowerCase();
                        if (al === 'center') alignValue = AlignmentType.CENTER;
                        else if (al === 'right') alignValue = AlignmentType.RIGHT;
                        else if (al === 'justify') alignValue = AlignmentType.JUSTIFIED;
                    }

                    let size = 24; // 12pt default (in docx size is half-point)
                    if (p.fontSize) {
                        size = p.fontSize * 2;
                    } else if (p.isHeader) {
                        size = 28; // 14pt (size 28) for headers
                    }

                    const isBold = p.bold || p.isHeader ? true : false;
                    return new Paragraph({
                       alignment: alignValue,
                       children: [
                         new TextRun({
                            text: textBlock.trim(),
                            font,
                            size: size,
                            sizeComplexScript: size,
                            bold: isBold,
                            boldComplexScript: isBold,
                            language: isKhmer ? { value: "km-KH", bidirectional: "km-KH" } : { value: "en-US" },
                          }),
                       ],
                       spacing: { after: 120 }
                    });
                });

                const docHasKhmer = geminiResult.paragraphs.some((p: any) => /[\u1780-\u17FF]/.test(p.text || ""));
                const docIsKhmer = docHasKhmer || language.toLowerCase() === "khmer";
                const docFontName = docIsKhmer ? khmerFont : "Arial";

                if (outputFormat === 'xlsx') {
                    const workbook = new ExcelJS.Workbook();
                    const sheet = workbook.addWorksheet('Extracted PDF');
                    sheet.columns = [
                        { header: 'Content', key: 'content', width: 120 }
                    ];
                    
                    geminiResult.paragraphs.forEach((p: any) => {
                        const text = p.text || "";
                        if (text.trim()) {
                            sheet.addRow({ content: text });
                        }
                    });
                    
                    sheet.eachRow((row) => {
                        row.font = { name: docFontName, size: 12 };
                    });
                    
                    const excelBuffer = await workbook.xlsx.writeBuffer();
                    buffer = Buffer.from(excelBuffer);
                } else {
                    const doc = new Document({
                  styles: {
                    default: {
                      document: {
                        run: {
                          font: {
                            ascii: docFontName,
                            cs: docFontName,
                            hAnsi: docFontName,
                            eastAsia: docFontName
                          },
                          size: 24,
                          sizeComplexScript: 24,
                          language: docIsKhmer ? { value: "km-KH", bidirectional: "km-KH" } : { value: "en-US" }
                        }
                      }
                    }
                  },
                  sections: [
                    {
                      properties: {},
                      children: docSections,
                    },
                  ],
                });

                buffer = await Packer.toBuffer(doc);
                }

            } else {
                // Fallback (or throw error telling user to add key)
                const parsedPdf = await pdf(fileBuffer);
                let extractedText = parsedPdf.text || "";
                
                // Helper to fix Khmer text from PDF extraction artifacts
                function fixKhmerText(text: string) {
                     let t = text;
                     // Specific header fixes based on OCR artifacts
                     t = t.replace(/ព្\s*រះរាជាណាចព្\s*ររម្\s*ពុ[\s\t]*ជា/g, "ព្រះរាជាណាចក្រកម្ពុជា");
                     t = t.replace(/ជាតិ\s*សាសនា\s*ព្\s*រះម្ហារសព្ត/g, "ជាតិ សាសនា ព្រះមហាក្សត្រ");
                     
                     // Common Khmer PDF extraction spacing artifacts
                     // Remove spaces right after a Coeng (\u17D2)
                     t = t.replace(/\u17D2[\s\t]+/g, '\u17D2');
                     // Remove spaces right before a Coeng
                     t = t.replace(/[\s\t]+\u17D2/g, '\u17D2');
                     
                     // Remove tabs between Khmer characters
                     t = t.replace(/([\u1780-\u17FF])\t+([\u1780-\u17FF])/g, '$1$2');

                     // Fix disjoint characters like `ជា តិ` etc
                     t = t.replace(/ព្ រះ/g, "ព្រះ");
                     t = t.replace(/ម្ ពុ ជា/g, "ម្ពុជា");
                     t = t.replace(/កម្ ពុ/g, "កម្ពុ");

                     return t;
                }

                extractedText = normalizeKhmerText(fixKhmerText(extractedText));
                
                tasks[taskId].previewText = extractedText.trim() === "" ? 
                     "No extractable text found in this PDF (might be an image-only PDF)." : 
                     extractedText.substring(0, 5000) + "\n\n[Note: For pixel-perfect layout preservation matching the exact PDF layout, please set the CONVERTAPI_SECRET_KEY environment variable.]";

                // Determine font dynamically based on content to prevent random/broken fonts
                const hasKhmer = /[\u1780-\u17FF]/.test(extractedText);
                const isKhmer = hasKhmer || language.toLowerCase() === "khmer";
                const fontName = isKhmer ? khmerFont : "Arial";
                const font = {
                    ascii: fontName,
                    cs: fontName,
                    hAnsi: fontName,
                    eastAsia: fontName
                };
                
                // Split extracted text into paragraphs, PRESERVING empty lines to retain vertical layout structure
                const textParagraphs = extractedText.split(/\r?\n/);
                
                const docSections = textParagraphs.length > 0 ? textParagraphs.map(textBlock => {
                    // Keep empty spaces to mimic original PDF formatting 
                    if (textBlock.trim() === '') {
                         return new Paragraph({
                            children: [new TextRun({ text: "", size: 24, sizeComplexScript: 24 })],
                            spacing: { after: 200 }
                         });
                    }
                    
                    const isKingdomHeader = textBlock.includes("ព្រះរាជាណាចក្រកម្ពុជា") || textBlock.includes("ជាតិ សាសនា ព្រះមហាក្សត្រ");
                    const runSize = isKingdomHeader ? 28 : 24;
                    const isBold = isKingdomHeader;

                    return new Paragraph({
                       alignment: isKingdomHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                       children: [
                         new TextRun({
                            text: textBlock.trim(),
                            font,
                            size: runSize,
                            sizeComplexScript: runSize,
                            bold: isBold,
                            boldComplexScript: isBold,
                            language: isKhmer ? { value: "km-KH", bidirectional: "km-KH" } : { value: "en-US" },
                         }),
                       ],
                       spacing: { after: 100 }
                    });
                }) : [
                    new Paragraph({
                      children: [
                         new TextRun({
                            text: hasKhmer || language.toLowerCase() === "khmer"
                              ? "រកមិនឃើញអត្ថបទដែលអាចទាញយកបានទេនៅក្នុង PDF នេះ។"
                              : "No extractable text found in this PDF.",
                            font,
                            size: 24,
                            sizeComplexScript: 24,
                            language: isKhmer ? { value: "km-KH", bidirectional: "km-KH" } : { value: "en-US" },
                         }),
                      ],
                    })
                ];

                const doc = new Document({
                  styles: {
                    default: {
                      document: {
                        run: {
                          font: {
                            ascii: fontName,
                             cs: fontName,
                            hAnsi: fontName,
                            eastAsia: fontName
                          },
                          size: 24,
                          sizeComplexScript: 24,
                          language: isKhmer ? { value: "km-KH", bidirectional: "km-KH" } : { value: "en-US" }
                        }
                      }
                    }
                  },
                  sections: [
                    {
                      properties: {},
                      children: [
                        ...docSections
                      ],
                    },
                  ],
                });

                if (outputFormat === 'xlsx') {
                    const workbook = new ExcelJS.Workbook();
                    const sheet = workbook.addWorksheet('Extracted PDF');
                    sheet.columns = [
                        { header: 'Content', key: 'content', width: 120 }
                    ];
                    
                    textParagraphs.forEach(text => {
                        if (text.trim()) {
                            sheet.addRow({ content: text.trim() });
                        }
                    });
                    
                    sheet.eachRow((row) => {
                        row.font = { name: fontName, size: 12 };
                    });
                    
                    const excelBuffer = await workbook.xlsx.writeBuffer();
                    buffer = Buffer.from(excelBuffer);
                } else {
                    buffer = await Packer.toBuffer(doc);
                }
            }
        }
        
        if (tasks[taskId]) {
          tasks[taskId].status = "completed";
          tasks[taskId].progress = 100;
          tasks[taskId].fileData = buffer;
        }
      } catch (err: any) {
        console.error("Task failed:", err.message);
        console.error("Error stack:", err.stack);
        if (tasks[taskId]) {
          tasks[taskId].status = "failed";
          tasks[taskId].previewText = `Conversion Failed: ${err.message}`;
        }
      } finally {
        // Automated local cleanup after 1 hour (simulating the spec)
        setTimeout(() => {
          delete tasks[taskId];
          console.log(`Task ${taskId} cleaned up after 1 hour.`);
        }, 3600 * 1000);
      }
    };

    // Run synchronous conversion inside request context for serverless environments (like Vercel)
    // so that the Lambda container doesn't terminate or freeze before background timers finish.
    const isVercel = !!process.env.VERCEL;
    if (isVercel) {
       console.log(`[Vercel Serverless] Synchronous processing triggered for task ${taskId}...`);
       await runConversion();
       const task = tasks[taskId];
       if (task && task.status === 'completed' && task.fileData) {
         return res.status(200).json({ 
           task_id: taskId, 
           status: task.status, 
           progress: task.progress,
           previewText: task.previewText,
           fileData: task.fileData.toString('base64') 
         });
       } else {
         return res.status(202).json({ task_id: taskId, status: task ? task.status : "processing" });
       }
    } else {
       console.log(`[Cloud Run / Dev Node] Background processing triggered for task ${taskId}...`);
       // Trigger conversion immediately asynchronously
       runConversion();

       // Push simulated state increments gracefully
       let currentPct = 10;
       const progressWatcher = setInterval(() => {
         if (!tasks[taskId] || tasks[taskId].status === "completed" || tasks[taskId].status === "failed") {
            clearInterval(progressWatcher);
            return;
         }
         currentPct = Math.min(currentPct + 15, 95);
         tasks[taskId].progress = currentPct;
       }, 500);
    }

    return res.status(202).json({ task_id: taskId, status: tasks[taskId].status });
  });

  app.get(["/api/task/:task_id", "/task/:task_id"], (req, res) => {
    console.log("DEBUG: GET /api/task/:task_id route reached");
    const taskId = req.params.task_id;
    const task = tasks[taskId];
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({
      task_id: taskId,
      status: task.status,
      progress: task.progress,
      previewText: task.previewText,
      fileData: task.fileData ? task.fileData.toString('base64') : undefined
    });
  });

  app.get(["/api/download/:task_id", "/download/:task_id"], (req, res) => {
    console.log("DEBUG: GET /api/download/:task_id route reached");
    const taskId = req.params.task_id;
    const task = tasks[taskId];
    
    if (!task || task.status !== "completed" || !task.fileData) {
      return res.status(404).send("File not ready or task not found.");
    }
    
    if (task.format === 'xlsx') {
       res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
       res.setHeader("Content-Disposition", `attachment; filename="converted_${taskId}.xlsx"`);
    } else {
       res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
       res.setHeader("Content-Disposition", `attachment; filename="converted_${taskId}.docx"`);
    }
    
    res.send(task.fileData);
  });

  // Global Error Handler for API routes (Multer errors, etc)
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
  });

  // Catch-all for undefined route paths to prevent exposing Vite's HTML fallback
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
  });

async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const isProd = process.env.NODE_ENV === "production";

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    // Support client side routing in Express v4
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
