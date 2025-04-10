const WebSocket = require("ws");
const osc = require("osc");

const wss = new WebSocket.Server({ port: 8080 });

const udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 7000, // Resolume OSC input port
});

udpPort.open();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (
      data.leftX !== undefined &&
      data.leftY !== undefined &&
      data.rightX !== undefined &&
      data.rightY !== undefined
    ) {
      // Forward each value as individual OSC messages
      udpPort.send({
        address: "/composition/dashboard/link1",
        args: [{ type: "f", value: data.leftX }],
      });
      udpPort.send({
        address: "/composition/dashboard/link2",
        args: [{ type: "f", value: data.leftY }],
      });
      udpPort.send({
        address: "/composition/dashboard/link3",
        args: [{ type: "f", value: data.rightX }],
      });
      udpPort.send({
        address: "/composition/dashboard/link4",
        args: [{ type: "f", value: data.rightY }],
      });

      console.log(
        `Left X: ${data.leftX}, Y: ${data.leftY} | Right X: ${data.rightX}, Y: ${data.rightY}`
      );
    }
  });
});
