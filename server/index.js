
const express = require("express");
const cors = require("cors");
const {
  LambdaClient,
  InvokeCommand,
} = require("@aws-sdk/client-lambda");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const lambda = new LambdaClient({
  region: "ap-southeast-2",
});

const FUNCTION_NAME = "NetworkAutomationController";

app.post("/api/execute", async (req, res) => {
  try {
    const { action, region, targetServer } = req.body;

    // Validate action
    const allowedActions = ["REROUTE", "ROLLBACK", "GET_STATE"];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        error: "Invalid action. Use REROUTE, ROLLBACK, or GET_STATE.",
      });
    }

    // GET_STATE does not require a region
    if (action !== "GET_STATE") {
      if (!region || !["Europe", "Asia"].includes(region)) {
        return res.status(400).json({
          error: "Invalid region. Allowed regions are Europe and Asia.",
        });
      }
    }

    // Validate target server for rerouting
    if (
      action === "REROUTE" &&
      !["Server-Alpha-Primary", "Server-Beta-Primary", "Server-Omega"].includes(targetServer)
    ) {
      return res.status(400).json({
        error: "Invalid or missing target server.",
      });
    }

    // Prepare Lambda event
    const payload = {
      action,
      ...(region ? { region } : {}),
      ...(action === "REROUTE" ? { targetServer } : {}),
    };

    const command = new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const result = await lambda.send(command);

    const responseText = Buffer.from(result.Payload || []).toString();
    const lambdaResponse = JSON.parse(responseText);

    if (result.FunctionError) {
      console.error("Lambda execution error:", lambdaResponse);

      return res.status(502).json({
        error: "Lambda execution failed.",
        details: lambdaResponse,
      });
    }

    const body =
      typeof lambdaResponse.body === "string"
        ? JSON.parse(lambdaResponse.body)
        : lambdaResponse.body;

    return res
      .status(lambdaResponse.statusCode || 200)
      .json(body || lambdaResponse);

  } catch (error) {
    console.error("AWS Lambda error:", error);

    return res.status(500).json({
      error: "Could not communicate with AWS Lambda.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
