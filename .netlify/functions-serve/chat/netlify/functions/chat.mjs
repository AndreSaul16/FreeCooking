
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/chat.js
var chat_default = async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await req.json();
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
export {
  chat_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvY2hhdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcSwgY29udGV4dCkgPT4ge1xyXG4gICAgLy8gU29sbyBwZXJtaXRpciBQT1NUXHJcbiAgICBpZiAocmVxLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFwiTWV0aG9kIE5vdCBBbGxvd2VkXCIsIHsgc3RhdHVzOiA0MDUgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgQVBJX0tFWSA9IHByb2Nlc3MuZW52LkRFRVBTRUVLX0FQSV9LRVk7XHJcblxyXG4gICAgaWYgKCFBUElfS0VZKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIlNlcnZlciBjb25maWd1cmF0aW9uIGVycm9yOiBNaXNzaW5nIEFQSSBLZXlcIiB9KSwge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDUwMCxcclxuICAgICAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkuZGVlcHNlZWsuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7QVBJX0tFWX1gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoZGF0YSksIHtcclxuICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGluIGNoYXQgZnVuY3Rpb246XCIsIGVycm9yKTtcclxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIgfSksIHtcclxuICAgICAgICAgICAgc3RhdHVzOiA1MDAsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUEsSUFBTyxlQUFRLE9BQU8sS0FBSyxZQUFZO0FBRW5DLE1BQUksSUFBSSxXQUFXLFFBQVE7QUFDdkIsV0FBTyxJQUFJLFNBQVMsc0JBQXNCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxFQUM3RDtBQUVBLFFBQU0sVUFBVSxRQUFRLElBQUk7QUFFNUIsTUFBSSxDQUFDLFNBQVM7QUFDVixXQUFPLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRSxPQUFPLDhDQUE4QyxDQUFDLEdBQUc7QUFBQSxNQUMxRixRQUFRO0FBQUEsTUFDUixTQUFTLEVBQUUsZ0JBQWdCLG1CQUFtQjtBQUFBLElBQ2xELENBQUM7QUFBQSxFQUNMO0FBRUEsTUFBSTtBQUNBLFVBQU0sT0FBTyxNQUFNLElBQUksS0FBSztBQUU1QixVQUFNLFdBQVcsTUFBTSxNQUFNLGdEQUFnRDtBQUFBLE1BQ3pFLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFFBQ2hCLGlCQUFpQixVQUFVLE9BQU87QUFBQSxNQUN0QztBQUFBLE1BQ0EsTUFBTSxLQUFLLFVBQVUsSUFBSTtBQUFBLElBQzdCLENBQUM7QUFFRCxVQUFNLE9BQU8sTUFBTSxTQUFTLEtBQUs7QUFFakMsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLElBQUksR0FBRztBQUFBLE1BQ3RDLFFBQVEsU0FBUztBQUFBLE1BQ2pCLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDbEQsQ0FBQztBQUFBLEVBRUwsU0FBUyxPQUFPO0FBQ1osWUFBUSxNQUFNLDJCQUEyQixLQUFLO0FBQzlDLFdBQU8sSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFLE9BQU8sd0JBQXdCLENBQUMsR0FBRztBQUFBLE1BQ3BFLFFBQVE7QUFBQSxNQUNSLFNBQVMsRUFBRSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDbEQsQ0FBQztBQUFBLEVBQ0w7QUFDSjsiLAogICJuYW1lcyI6IFtdCn0K
