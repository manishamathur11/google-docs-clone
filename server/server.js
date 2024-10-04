const mongoose = require("mongoose")
const Document = require("./Document")
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

mongoose.connect(
  "mongodb+srv://manisha:1234@cluster0.xvjx3my.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
)


// Use CORS middleware
app.use(cors({
  origin: ["https://google-docs-clone-6dgl.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true // allow credentials if necessary
}));

const io = new Server(server, {
  cors: {
    origin: ["https://google-docs-clone-6dgl.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true // allow credentials if necessary
  }
});

io.on("connection", (socket) => {
  console.log("New connection established");
  // Your socket.io logic here
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
