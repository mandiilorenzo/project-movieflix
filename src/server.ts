import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (req, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true
        }
    });

    res.json(movies);
});

app.post("/movies", async (req, res) => {
    const { title, release_date, genre_id, language_id, oscar_count, duration } = req.body;

    try {
        await prisma.movie.create({
            data: {
                title,
                release_date: new Date(release_date),
                genre_id,
                language_id,
                oscar_count,
                duration
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to create movie" });
    }

    res.status(201).send();
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
