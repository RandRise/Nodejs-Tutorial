import express from 'express';
import pg from 'pg';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.mjs';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'
import {
    add_city, update_city,
    display_cities,
    display_city,
    delete_city,
    add_student,
    display_student,
    display_students,
    delete_student,
    update_student
} from './db.mjs';
dotenv.config();

const pool = new pg.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
})



//Create an Express application

const app = express();


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));


const upload = multer({ dest: path.join(__dirname, '/uploads/images') });

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('json replacer', function (key, value) {
    if (this[key] instanceof Date) {
        value = this[key].toLocaleString();
    }
    return value;
});

//Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Define API end points
/**
 * @swagger
 * /api/city/{id}:
 *   get:
 *     summary: Get city details by ID
 *     description: Retrieve details of a specific city based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the city to retrieve
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example: { city: { id: "...", name: "...", ... } }
 */
app.get("/api/city/:id?", async (req, res) => {
    const id = req.params.id;

    let sortDirection = req.query.sort?.toLowerCase();
    if (!sortDirection) sortDirection = "asc";
    if (sortDirection != "asc" && sortDirection != "desc") sortDirection = "asc";

    var response = {
        statusCode: 200,
        message: 'Success',
        exception: null,
        result: []
    };
    let c;
    try {
        c = await pool.connect();

        if (id !== undefined) {
            response.result = await display_city(c, id);
            //res.json(await display_city(c, id));
        }
        else {
            //res.json(await display_cities (c));
            response.result = await display_cities(c, sortDirection);
        }
        return res.json(response);

    }

    catch (err) {
        console.error("Error Displaying cities", err)
        //res.status(500).json(err);
        response = {
            statusCode: 500,
            message: 'Failed to display cities',
            exception: err,
            result: []
        }
        return res.json(response);

    }
    finally {
        if (c) c.release();
    }
});
/**
 * @swagger
 * /api/city:
 *   post:
 *     summary: Create a new city
 *     description: Create a new city.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { name: "CityName" }
 *     responses:
 *       200:
 *         description: City created successfully
 *         content:
 *           application/json:
 *             example: { city: { id: "...", name: "...", ... } }
 */
app.post("/api/city", async (req, res) => {
    console.log(req.body);
    const name = req.body.name;
    var response = {
        statusCode: 200,
        message: 'City added successfully',
        exception: null,
        result: []
    }

    let c;
    try {
        c = await pool.connect();
        //res.json(await add_city(c, name));
        response.result = await add_city(c, name);
        return res.json(response);
    }
    catch (err) {
        console.error("Error in /api/city (POST)", err);
        response = {
            statusCode: 500,
            message: err.message,// 'Failed to add city',
            exception: err.detail,
            result: null
        }
        return res.json(response);
        //res.status(500).json(err);
    }
    finally {
        if (c) c.release();
    }
});
/**
 * @swagger
 * /api/city/{id}:
 *   delete:
 *     summary: Delete a city by ID
 *     description: Delete a city based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the city to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: City deleted successfully
 *         content:
 *           application/json:
 *             example: { city: { id: "...", name: "...", ... } }
 */
app.delete("/api/city/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    var response = {
        statusCode: 200,
        message: 'City deleted successfully',
        exception: null,
        result: []
    }
    let c;
    try {
        console.log("Deleting...")
        c = await pool.connect();
        //res.json(await delete_city(c , id));
        response.result = await delete_city(c, id);
        console.log("Deleted.")
    }
    catch (err) {

        response = {
            statusCode: 500,
            message: 'Error deleting city',
            exception: err,
            result: []
        }

        //res.status(500).json(err);
    }
    finally {
        if (c) c.release();
    }
    res.json(response);
});
/**
 * @swagger
 * /api/city/{id}:
 *   put:
 *     summary: Update city details by ID
 *     description: Update details of a specific city based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the city to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { name: "NewCityName" }
 *     responses:
 *       200:
 *         description: City updated successfully
 *         content:
 *           application/json:
 *             example: { city: { id: "...", name: "...", ... } }
 */
app.put("/api/city/:id", async (req, res) => {
    const id = req.params.id;
    const name = req.body.name;

    var response = {
        statusCode: 200,
        message: 'City updated successfully',
        exception: null,
        result: []
    }
    let c;
    try {
        c = await pool.connect();
        //res.json(await update_city(c , id , name));
        response.result = await update_city(c, id, name);
    }
    catch (err) {
        //res.status(500).json(err);
        response = {
            statusCode: 500,
            message: 'Failed to update city',
            exception: err,
            result: []
        }


    }
    finally {
        if (c) c.release();
    }
    res.json(response);

});

/**
 * @swagger
 * /api/student/{id}:
 *   get:
 *     summary: Get student details by ID
 *     description: Retrieve details of a specific student based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the student to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *         content:
 *           application/json:
 *             example: { id: "...", first_name: "...", last_name: "...", date_of_birth: "...", city_of_birth: "..." }
 *       500:
 *         description: Error retrieving student details
 *         content:
 *           application/json:
 *             example: { statusCode: 500, message: "Failed to retrieve student details", exception: "...", result: [] }
 */
/**
 * @swagger
 * /api/student:
 *   get:
 *     summary: Get all students
 *     description: Retrieve details of all students.
 *     parameters:
 *       - in: query
 *         name: sort
 *         description: Sort direction (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Students details retrieved successfully
 *         content:
 *           application/json:
 *             example: [{ id: "...", first_name: "...", last_name: "...", date_of_birth: "...", city_of_birth: "..." }, ...]
 *       500:
 *         description: Error retrieving students details
 *         content:
 *           application/json:
 *             example: { statusCode: 500, message: "Failed to retrieve students details", exception: "...", result: [] }
 */

app.get("/api/student/:id?", async (req, res) => {
    const id = req.params.id;

    let sortDirection = req.query.sort?.toLowerCase();
    if (!sortDirection) sortDirection = "asc";
    if (sortDirection != "asc" && sortDirection != "desc") sortDirection = "asc";

    var response = {
        statusCode: 200,
        message: 'Success',
        exception: 'null',
        result: []
    };
    let c;
    try {
        c = await pool.connect();
        if (id !== undefined) {
            response.result = await display_student(c, id);
        }
        else {
            response.result = await display_students(c, sortDirection);
        }
        return res.json(response);
    }
    catch (err) {
        console.log("Error displaying students", err);
        response = {
            statusCode: 500,
            message: 'Failed displaying students',
            exception: err,
            result: []
        }
        return res.json(response)
    }
    finally {
        if (c) c.release();
    }
});
/**
 * @swagger
 * /api/student:
 *   post:
 *     summary: Add a new student
 *     description: Add a new student to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The first name of the student.
 *               last_name:
 *                 type: string
 *                 description: The last name of the student.
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the student (YYYY-MM-DD).
 *               city_of_birth_id:
 *                 type: string
 *                 description: The city of birth of the student.
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: The image file of the student.
 *     responses:
 *       '200':
 *         description: Student added successfully
 *         content:
 *           application/json:
 *             example: 
 *               id: "..."
 *               first_name: "..."
 *               last_name: "..."
 *               date_of_birth: "..."
 *               city_of_birth: "..."
 *       '500':
 *         description: Error adding student
 *         content:
 *           application/json:
 *             example: 
 *               statusCode: 500
 *               message: "Failed to add student"
 *               exception: "..."
 *               result: []
 */



// app.post("/api/student", upload.single('img'), async (req, res) => {
//     console.log(req.body);
//     console.log("Request File", req.file);
//     // Read binary data of the file
//     const binaryData = fs.readFileSync(req.file.path);

//     // Convert binary data to base64 string
//     const base64String = Buffer.from(binaryData).toString('base64');

//     const first_name = req.body.first_name;
//     const last_name = req.body.last_name;
//     const date_of_birth = req.body.date_of_birth;
//     const city_of_birth_id = req.body.city_of_birth_id;
//     const img = base64String;
//     var response = {
//         statusCode: 200,
//         message: 'Student added successfully',
//         exception: null,
//         result: []
//     }
//     let c;
//     try {
//         c = await pool.connect();
//         response.result = await add_student(c,
//             first_name,
//             last_name,
//             date_of_birth,
//             city_of_birth_id,
//             img
//         );
//         return res.json(response);
//     }
//     catch (err) {
//         console.log('Error in api/student (POST)', err);
//         response = {
//             statusCode: 500,
//             message: err.message,
//             exception: err.detail,
//             result: null
//         }
//         return res.json(response);
//     }
//     finally {
//         if (c) c.release();
//     }

// })
app.post("/api/student", upload.single('img'), async (req, res) => {
    try {
        let img = null;


        if (req.file) {

            const binaryData = fs.readFileSync(req.file.path);

            const base64String = Buffer.from(binaryData).toString('base64');

            img = base64String;

        } else {

            console.log("No Image Uploaded");
        }

        const { first_name, last_name, date_of_birth, city_of_birth_id } = req.body;

        let c = await pool.connect();
        let result = await add_student(c, first_name, last_name, date_of_birth, city_of_birth_id, img);
        c.release();


        return res.json({
            statusCode: 200,
            message: 'Student added successfully',
            result
        });
    } catch (err) {
        console.log('Error in api/student (POST)', err);
        return res.status(500).json({
            statusCode: 500,
            message: err.message,
            exception: err.detail,
            result: null
        });
    }
});

/**
 * @swagger
 * /api/student/{id}:
 *   delete:
 *     summary: Delete student by ID
 *     description: Delete a specific student based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the student to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             example: { id: "...", first_name: "...", last_name: "...", date_of_birth: "...", city_of_birth: "..." }
 *       500:
 *         description: Error deleting student
 *         content:
 *           application/json:
 *             example: { statusCode: 500, message: "Failed to delete student", exception: "...", result: [] }
 */

app.delete("/api/student/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    var response = {
        statusCode: 200,
        message: 'Student Record Deleted',
        exception: null,
        result: []
    }
    let c;
    try {
        c = await pool.connect();
        response.result = await delete_student(c, id);
        console.log("Deleted Record");
    } catch (err) {
        response = {
            statusCode: 500,
            message: "Error Deleting Record",
            exception: err.detail,
            result: []
        }
    }
    finally {
        if (c) c.release();
    }
    res.json(response);
});

/**
 * @swagger
 * /api/student/{id}:
 *   put:
 *     summary: Update student details by ID
 *     description: Update details of a specific student based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the student to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The updated first name of the student.
 *               last_name:
 *                 type: string
 *                 description: The updated last name of the student.
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: The updated date of birth of the student (YYYY-MM-DD).
 *               city_of_birth_id:
 *                 type: integer
 *                 description: The updated city of birth ID of the student.
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: The updated image file of the student.
 *     responses:
 *       200:
 *         description: Student details updated successfully
 *         content:
 *           application/json:
 *             example: { id: "...", first_name: "...", last_name: "...", date_of_birth: "...", city_of_birth_id: "...", img: "..." }
 *       500:
 *         description: Error updating student details
 *         content:
 *           application/json:
 *             example: { statusCode: 500, message: "Failed to update student details", exception: "...", result: [] }
 */

app.put("/api/student/:id", upload.single('img'), async (req, res) => {
    const id = req.params.id;
    let img = null;

    if (req.file) {
        const binaryData = fs.readFileSync(req.file.path);
        const base64String = Buffer.from(binaryData).toString('base64');
        img = base64String;
    } else {
        console.log("No Image Uploaded");
    }

    const {
        first_name,
        last_name,
        date_of_birth,
        city_of_birth_id
    } = req.body;

    var response = {
        statusCode: 200,
        message: "Update Success!",
        exception: null,
        result: []
    };

    let c;
    try {
        c = await pool.connect();
        response.result = await update_student(
            c,
            id,
            first_name,
            last_name,
            date_of_birth,
            city_of_birth_id,
            img
        );
    } catch (err) {
        response = {
            statusCode: 500,
            message: 'Error Updating Student Record',
            exception: err.detail,
            result: []
        };
    } finally {
        if (c) c.release();
    }
    res.json(response);
});
app.listen(3001, () => console.log("Server is listening on port 3001"));