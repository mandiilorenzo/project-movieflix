"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to create movie" });
    }
    res.status(201).send();
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
        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
        await prisma.movie.update({
            where: {
                id
            },
            data: data
        });
    }
    catch (error) {
        res.status(500).send({ message: "Failed to update movie" });
        console.log(error);
    }
    res.status(200).send();
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to search movies by genre" });
    }
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
