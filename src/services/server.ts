import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "../../swagger.json";
import authRoutes from "../routes/auth.route";
import "dotenv/config";
import { authenticateToken } from "../middlewares/auth.middleware";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/movies", authenticateToken, async (req, res) => {
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

app.get("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            },
            include: {
                genres: true,
                languages: true
            }
        });
        if (!movie) {
            res.status(404).send({ message: "Movie not found" });
        }
        res.status(200).json(movie);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch movie" });
    }
});

app.post("/movies", async (req, res) => {
    const { title, release_date, genre_id, language_id, oscar_count, duration } = req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } }
        });
        if (movieWithSameTitle) {
            res.status(409).send({ message: "Movie with this title already exists" });
        }

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
        res.status(201).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to create movie" });
    }

});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });
        if (!movie) {
            res.status(404).send({ message: "Movie not found" });
        }

        const {
            title,
            release_date,
            genre_id,
            language_id,
            oscar_count,
            duration,
        } = req.body;
        console.log(req.body);

        const updateMovie = await prisma.movie.update({
            where: {
                id
            },
            data: {
                title,
                release_date: release_date ? new Date(release_date) : undefined,
                genre_id,
                language_id,
                oscar_count,
                duration,
            },
        });

        res.status(200).json(updateMovie);
    } catch (error) {
        res.status(500).send({ message: "Failed to update movie" });
        console.log(error);
    }
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });
        if (!movie) {
            res.status(404).send({ message: "Movie not found" });
        }

        await prisma.movie.delete({
            where: {
                id
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Failed to delete movie" });
        console.log(error);
    }

    res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {
    const { genreName } = req.params;

    try {
        const moviesFilteredByGenre = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: "insensitive"
                    }
                }
            }
        });

        if (moviesFilteredByGenre.length === 0) {
            res.status(404).send({ message: "No movies found for this genre" });
        }

        res.status(200).json(moviesFilteredByGenre);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to search movies by genre" });
    }
});

app.use("/auth", authRoutes);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
