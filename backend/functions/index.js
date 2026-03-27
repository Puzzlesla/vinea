
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";

const openAIKey = defineString("OPENAI_API_KEY");

setGlobalOptions({ maxInstances: 10 });

initializeApp();

const db = getFirestore();




export const generateProjectTree = onCall({}, async (request) => {
    const openai = new OpenAI({ apiKey: openAIKey.value() });  

    if (!request.auth) {
        console.warn("Unauthenticated request to generateProjectTree");
        throw new HttpsError("unauthenticated", "Please log in first!");
    }
    try{
    const { userPrompt, projectId } = request.data;
    console.info("Processing generateProjectTree request");
        const systemPrompt = `You are the core reasoning engine for 'promptai', an intelligent workflow visualizer designed for visual learners. Your job is to break down massive, overwhelming projects into frictionless, bite-sized tasks based on the Atomic Habits philosophy.
        CRITICAL INSTRUCTIONS:
            1. JSON ONLY: Return ONLY a raw, minified JSON object. Do not wrap it in markdown backticks (e.g., \`\`\`json). Do not include any introductory or concluding text. If you output anything other than raw JSON, the system will crash.
            2. FLAT ARCHITECTURE: Do NOT nest nodes. You must generate a strictly flat 'nodes' array and a strictly flat 'edges' array for React Flow.
            3. SPATIAL MATH: You must calculate the 'position' for every node. 
                - Start the first node at {"x": 250, "y": 0}.
                - For sequential tasks, increase the 'y' value by 150 for each step.
                - For parallel tasks, keep the same 'y' value but space them out on the 'x' axis (e.g., {"x": 100, "y": 150} and {"x": 400, "y": 150}).
            4. ATOMIC SIZING: Break complex topics into the smallest actionable steps possible. A node should take no more than 1-2 hours to complete.

            REQUIRED OUTPUT SCHEMA:
                {
                    "project_metadata": {
                        "title": "string (Short, punchy title)",
                        "total_xp_available": "number (Calculate the sum of all node XP)",
                        "total_nodes": "number (The total count of nodes in the array)",
                        "ai_assessment": "string (A 1-sentence encouraging analysis of the workload)"
                    },
                    "reactFlowData": {
                        "nodes": [
                        {
                            "id": "string (e.g., 'node_1')",
                            "type": "actionableTask",
                            "position": { "x": number, "y": number },
                            "data": {
                            "label": "string (Start with a strong action verb)",
                            "status": "pending",
                            "xp_value": "number (The experience points awarded for completing the task)",
                            "resources": ["string (Specific book chapter, concept to Google, or tool)"]
                            }
                        }
                        ],
                        "edges": [
                        {
                            "id": "string (e.g., 'edge_1-2')",
                            "source": "string (must match a node_id)",
                            "target": "string (must match a node_id)",
                            "animated": true
                        }
                        ]
                    }
                }`;

        console.info("Sending request to OpenAI");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: {
                type: "json_object"
            },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const aiResponse = response.choices[0].message.content;
        const aiData = JSON.parse(aiResponse);

        await db.collection("projects").doc(projectId).set({
            userId: request.auth.uid,
            status: "active",
            reactFlowData: aiData,
            createdAt: FieldValue.serverTimestamp()
        }, { merge: true });

        console.info("Project tree generated and saved successfully!");
        return { success: true };
    } catch (error) {
        console.error("Error generating project tree:", error);
        throw new HttpsError("internal", "An error occurred while the AI was generating the project tree.");
    }
});