import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (_, res) => {
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
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } }
        });
        if (movieWithSameTitle) {
            res.status(409).send({ message: "Filme já cadastrado" });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movieUndefined = await prisma.movie.findUnique({
            where: {
                id
            }
        });
        if (!movieUndefined) {
            res.status(404).send({ message: "Filme não encontrado" });
        }

        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        await prisma.movie.update({
            where: {
                id
            },
            data: data
        });
    } catch (error) {
        res.status(500).send({ message: "Falha ao atualizar o filme" });
        console.log(error);
    }

    res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movieUndefined = await prisma.movie.findUnique({
            where: {
                id
            }
        });
        if (!movieUndefined) {
            res.status(404).send({ message: "Filme não encontrado" });
        }

        await prisma.movie.delete({
            where: {
                id
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Falha ao deletar o filme" });
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
            res.status(404).send({ message: "Nenhum filme encontrado para esse gênero" });
        } 

        res.status(200).json(moviesFilteredByGenre);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Falha ao buscar filmes por gênero" });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});