import fs from 'fs'
import path from 'path';
export async function add_city(client, city_name) {
    try {
        const res = await client.query(`insert into cities(name) values($1) returning *`, [city_name]);
        //await client.query('COMMIT')
        console.log("Completed. Added row:", res.rows);
        return res.rows;


    } catch (err) {
        console.error("Error adding city:", err);
        throw err;// new Error("City already exists")
    }
}

export async function delete_city(client, id) {

    const res = await client.query(`delete from cities where id = $1 returning *`, [id]);
    console.log("Completed. Deleted row:", res.rows);
    return res.rows;
}
export async function update_city(client, id, city_name) {
    try {
        const res = await client.query(`update cities set name = $2 where id = $1 returning *`, [id, city_name]);
        console.log("Completed. Updated row:", res.rows);
        return res.rows;
    } catch (err) {
        // catch errors
        console.log(err);
    }
}

export async function display_cities(client, sortDirection) {
    try {

        const res = await client.query(`select * from cities order by name ${sortDirection}`);
        // display results
        res.rows.forEach(r => {
            console.log(r);
        });
        return res.rows;
    } catch (err) {
        // catch errors
        console.log(err);
    }
}

export async function display_city(client, id) {
    try {
        const res = await client.query(`select * from cities where id=$1`, [id]);
        // display results
        res.rows.forEach(r => {
            console.log(r);
        });
        return res.rows;
    } catch (err) {
        // catch errors
        console.log(err);
    }
}

export async function display_student(client, id) {
    try {
        const res = await client.query(`
        select 
	        s.student_id, s.first_name || ' ' || s.last_name as "full name", 
	        s.city_of_birth_id, c."name" as "City Of Birth" , s.date_of_birth, s.img
        from 
            students s inner join cities c on s.city_of_birth_id = c.id 
        where student_id=$1
        `, [id]);
        console.dir(res.rows);
        return res.rows;
    } catch (err) {
        console.log(err);
    }
}
export async function display_students(client, sortDirection) {
    try {
        const res = await client.query(`
    SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "date_of_birth",
    c."name" AS "city_of_birth",
    s."city_of_birth_id" AS "city_of_birth_id",
    s.first_name || ' ' || s.last_name AS "full_name",
    s.img
FROM 
    students s 
INNER JOIN 
    cities c ON s.city_of_birth_id = c.id 
ORDER BY 
    s.first_name ${sortDirection}
    `);
        console.dir(res.rows);
        return res.rows;
    } catch (err) {
        console.log(err);
    }
}


// export async function add_student(
//     client,
//     student_firstName,
//     student_lastName,
//     date_of_birth,
//     city_of_birth_id,
//     img
// ) {
//     try {
//         // Check if img is null or empty, and handle it accordingly
//         if (!img) {
//             img = null; // or handle default image logic if needed
//         }
        
//         const res = await client.query(`
//             INSERT INTO students (
//                 first_name,
//                 last_name,
//                 date_of_birth,
//                 city_of_birth_id,
//                 img
//             ) VALUES ($1, $2, $3, $4, $5) RETURNING *
//         `, [
//             student_firstName,
//             student_lastName,
//             date_of_birth,
//             city_of_birth_id,
//             img
//         ]);
        
//         console.log("Completed. Added row:", res.rows);
//         return res.rows;
//     } catch (err) {
//         console.log("Error adding new student", err);
//         throw err;
//     }
// }
// export async function add_student(
//     client,
//     student_firstName,
//     student_lastName,
//     date_of_birth,
//     city_of_birth_id,
//     img
    
// ) {
//     try {
//         const res = await client.query(`insert into students(
//             first_name,
//             last_name,
//             date_of_birth,
//             city_of_birth_id,
//             img
//             ) values($1, $2, $3, $4, $5) returning *`, [
//             student_firstName,
//             student_lastName,
//             date_of_birth,
//             city_of_birth_id,
//             img
//             ]);
//         console.log("Completed. Added row:", res.rows);
//         return res.rows;
//     } catch (err) {
//         console.log("Error adding new student", err);
//         throw err;
//     }
// }

export async function add_student(
    client,
    first_name,
    last_name,
    date_of_birth,
    city_of_birth_id,
    img) {
    try {
        // Decode Base64 encoded image data if provided
        const imageData = img ? Buffer.from(img, 'base64') : null;
        const res = await client.query(`insert into students(first_name, last_name, date_of_birth, city_of_birth_id, img) values($1, $2, $3, $4, $5) returning *`, [first_name, last_name, date_of_birth, city_of_birth_id, imageData]);

        if (imageData) {
            const filePath = path.join(__dirname, '..', 'uploads', 'images',`${res.rows[0].id.png}`);
            fs.writeFileSync(filePath, imageData);
            console.log(`Image saved to ${filePath}`);
        }
        console.log("Completed. Added row:", res.rows);
        return res.rows;
    } catch (err) {
        console.log("Error adding new student", err);
        throw err;
    }
}

export async function delete_student(client, id) {
    try {
        const res = await client.query(`delete from students where student_id = $1 returning *`, [id]);
        console.log("Deletion Completed !: ", res.rows);
        return res.rows;
    } catch (err) {
        console.log("Error Deleting City", err);
        throw err;
    }
}
export async function update_student(client,
    student_id,
    first_name,
    last_name,
    date_of_birth,
    city_of_birth_id) {

    try {
        const res = await client.query(`update students set 
        first_name = $2 ,
        last_name = $3 ,
        date_of_birth = $4 ,
        city_of_birth_id = $5 
        where 
        student_id = $1 returning *`,
            [student_id,
                first_name,
                last_name,
                date_of_birth,
                city_of_birth_id]);
        console.log("Completed. Updated row", res.rows);
        return res.rows;

    } catch (err) {
        console.log("Error updating student record", err);
        throw err;
    }
}