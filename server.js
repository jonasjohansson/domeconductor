const WebSocket = require("ws");
const osc = require("osc");

const wss = new WebSocket.Server({ port: 8080 });

const udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 7000, // Resolume OSC input
});

udpPort.open();

let smoothedValue = 0; // initial state
const smoothingFactor = 0.1; // smaller = slower transition
const minDist = 30;
const maxDist = 400;

function mapAndClamp(val, inMin, inMax, outMin, outMax) {
  const mapped = ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  return Math.max(outMin, Math.min(outMax, mapped));
}

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.handDistance !== undefined) {
      const raw = data.handDistance;

      // Scale to 0.0 – 10.0
      const target = mapAndClamp(raw, minDist, maxDist, 0.0, 1.0);

      // Smooth using lerp
      smoothedValue =
        smoothedValue + (target - smoothedValue) * smoothingFactor;

      // Send with high resolution
      udpPort.send({
        address: "/composition/speed",
        args: [{ type: "f", value: parseFloat(smoothedValue.toFixed(3)) }],
      });

      console.log("OSC /handsApart:", smoothedValue.toFixed(3));
    }
  });
});
