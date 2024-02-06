import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import HttpStatusCode from "./status-codes";

const app = express();
app.use(express.json());

// All code should go below this line
app.get("/", (req, res) => {
  return res.send({ message: "Hello World!" });
});

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  return res.status(HttpStatusCode.OK).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .send({ message: "id should be a number" });
  }

  const dog = await prisma.dog.findUnique({
    where: { id: id },
  });

  if (!dog) {
    return res.status(HttpStatusCode.NO_CONTENT).send();
  } else {
    return res.status(HttpStatusCode.OK).send(dog);
  }
});

app.post("/dogs", async (req, res) => {
  const dogKeys = ["name", "description", "age", "breed"];
  const { name, description, age } = req.body;
  const errors: string[] = [];

  for (const key of Object.keys(req.body)) {
    if (!dogKeys.includes(key)) {
      errors.push(`${key} is not a valid key`);
    }
  }

  if (typeof name !== "string") {
    errors.push("name should be a string");
  }

  if (typeof description !== "string") {
    errors.push("description should be a string");
  }

  if (typeof age !== "number") {
    errors.push("age should be a number");
  }

  if (errors.length > 0) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .send({ errors });
  } else {
    const dog = await prisma.dog.create({
      data: req.body,
    });

    return res.status(HttpStatusCode.CREATED).send(dog);
  }
});

// FIXME:
app.delete("/dogs/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(HttpStatusCode.BAD_REQUEST)
      .send({ message: "id should be a number" });
  }

  const dog = await prisma.dog.findUnique({
    where: { id: id },
  });

  if (!dog) {
    return res.status(HttpStatusCode.NO_CONTENT).send();
  } else {
    const deletedDog = await prisma.dog.delete({
      where: { id: id },
    });

    return res.status(HttpStatusCode.OK).send(deletedDog);
  }
});

// TODO:
// app.patch("/dogs/:id", async (req, res) => {});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
