const express = require('express');
const cors = require('cors');
const cookies = require("cookie-parser");
const path = require('path');
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const settingsRouter = require("./routes/settings");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const labsRouter = require("./routes/labs");
const streamsRouter = require("./routes/streams");
const adminRouter = require("./routes/admin");
const scheduleRouter = require("./routes/schedule");
const appointmentsRouter = require("./routes/appointments");
const roomRouter = require("./routes/room");
const streamRoomRouter = require("./routes/stream-room");
const bowlsRouter = require("./routes/bowls");
const bowlsScheduleRouter = require("./routes/bowls-schedule");
const coursesRouter = require("./routes/courses");
const {initDb} = require("./db/db");

const app = express();

// чтобы парсился POST в виде JSON
app.use(express.json());

// чтобы парсились куки
app.use(cookies());

app.use(
    cors({
        credentials: true, // чтобы работали secured куки
        origin: true // автоматом подставляется текущий сервер в Origin
    })
);

app.get("/", (req, res) => {
    res.status(200).json({ok: true});
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/settings", settingsRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/labs", labsRouter);
app.use("/streams", streamsRouter);
app.use("/admin", adminRouter);
app.use("/schedule", scheduleRouter);
app.use("/appointments", appointmentsRouter);
app.use("/room", roomRouter);
app.use("/stream-room", streamRoomRouter);
app.use("/bowls", bowlsRouter);
app.use("/bowls-schedule", bowlsScheduleRouter);
app.use("/courses", coursesRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 3001;
(async () => {
    await initDb();
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`)
    });
})();
