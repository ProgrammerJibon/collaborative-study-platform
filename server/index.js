const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const sign = require('jwt-encode');
const { jwtDecode } = require("jwt-decode");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOpts = {
    origin: ['https://education-tutor-hub.netlify.app/', 'http://localhost:5173'],
    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "OPTIONS"
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOpts));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tmpPath = '/tmp';
        cb(null, tmpPath);  // Save files to /tmp
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);  // Use original filename
    }
});


const upload = multer({ storage });



const uri = "mongodb+srv://spider:SzvmPr64wMXiip0V@cluster0.p0tuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let db, usersCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db("collaborative-study-platform");
        usersCollection = db.collection("users");
        console.log("Connected to database...");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}


connectToDatabase();

async function ensureDBConnection(req, res, next) {
    if (!usersCollection) {
        try {
            await connectToDatabase();
        } catch (error) {
            return res.status(500).json({ error: "Failed to connect to the database." });
        }
    }
    next();
}

app.use(ensureDBConnection);


const jwtSecret = "sssssssaaaaaamiiiiiiiihaaaaaaa";
const encodeToken = (data) => {
    return sign(btoa(btoa(Date.now()) + "\n" + btoa(data) + "\n" + btoa(Date.now() * 256)), jwtSecret);
}

const decodeToken = (token) => {
    let jwtDecoded = jwtDecode(token);
    return (atob(atob(jwtDecoded).split("\n")[1]));
}



app.get('/images/*', (req, res) => {
    const filePath = path.join('/tmp', req.params[0]);  // Extract file name from URL
    const extname = path.extname(filePath).toLowerCase();

    fs.exists(filePath, (exists) => {
        if (exists) {
            res.setHeader('Content-Type', "image/" + extname);  // Set the content-type header
            fs.createReadStream(filePath).pipe(res);  // Stream the file content to the response
        } else {
            res.status(404).json({ error: 'File not found' });  // Return error if file doesn't exist
        }
    });
});



app.get("/", async (req, res) => {
    res.status(200).send("It's working as v.1.0 (collaborative-study-platform)");
});

// app.get("/users", async (req, res) => {
//     try {
//         const users = await usersCollection.find().toArray();
//         res.status(200).json(users);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

app.get('/users', async (req, res) => {
    const { search = '' } = req.query;

    try {
        const usersCollection = db.collection('users');

        const users = await usersCollection
            .find({
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
                    { email: { $regex: search, $options: 'i' } },
                ],
            })
            .toArray();

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});



app.put('/update-user-role/:userId', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ error: 'Role is required.' });
    }

    try {
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { role } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found or no changes made.' });
        }

        res.status(200).json({ message: 'User role updated successfully.' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role.' });
    }
});


app.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        delete user.password;
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/login/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const id = decodeToken(token);

        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        delete user.password;
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/users", async (req, res) => {
    const { name, email, avatar, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const newUser = { name, email, avatar, password, role };
        const result = await usersCollection.insertOne(newUser);
        const insertedUser = await usersCollection.findOne({ _id: result.insertedId });

        insertedUser.token = encodeToken(String(insertedUser._id));
        res.status(201).json(insertedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const user = await usersCollection.findOne({ email });
        if (user) {
            if (user.password === password) {
                user.token = encodeToken(String(user._id));
                return res.status(200).json(user);
            } else {
                return res.status(401).json({ error: "Invalid password" });
            }
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


async function fetchImageAsBase64(imageUrl, refererUrl) {
    try {
        const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'Referer': refererUrl,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get('content-type');
        const base64Image = Buffer.from(buffer).toString('base64');

        return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
}



app.post("/google-login", async (req, res) => {
    const { name, email, avatar, role } = req.body;

    let image = avatar;
    if(!image){
        image = "https://png.pngtree.com/png-vector/20191101/ourmid/pngtree-cartoon-color-simple-male-avatar-png-image_1934459.jpg";
    }else{
        image = await fetchImageAsBase64(image);
    }

    if (!name || !email || !image || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
            await usersCollection.updateOne(
                { email },
                { $set: { name, avatar: image } }
            );

            const updatedUser = await usersCollection.findOne({ email });
            updatedUser.token = encodeToken(String(updatedUser._id));

            return res.status(200).json(updatedUser);
        } else {
            const newUser = { name, email, avatar: image, password: "", role };

            const result = await usersCollection.insertOne(newUser);
            const insertedUser = await usersCollection.findOne({ _id: result.insertedId });

            insertedUser.token = encodeToken(String(insertedUser._id));
            return res.status(201).json(insertedUser);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/test", async (req, res) => {
    try {
        const test = await db.collection("test")
            .find({})
            .toArray();
        res.status(200).json(test);
    } catch (err) {
        res.status(200).json([]);
    }
});




app.post("/study-sessions", async (req, res) => {
    const {
        title,
        tutorName,
        tutorEmail,
        userId,
        description,
        regStartDate,
        regEndDate,
        classStartDate,
        classEndDate,
        duration,
        regFee,
        status,
        additionalInfo,
    } = req.body;

    if (
        !title ||
        !userId ||
        !tutorName ||
        !tutorEmail ||
        !description ||
        !regStartDate ||
        !regEndDate ||
        !classStartDate ||
        !classEndDate ||
        !duration ||
        !status
    ) {
        return res.status(400).json({ error: "All required fields must be filled." });
    }

    try {
        const studySessionsCollection = db.collection("studySessions");

        const newSession = {
            title,
            userId,
            tutorName,
            tutorEmail,
            description,
            regStartDate: new Date(regStartDate),
            regEndDate: new Date(regEndDate),
            classStartDate: new Date(classStartDate),
            classEndDate: new Date(classEndDate),
            duration,
            regFee: regFee || 0,
            status: status || "Pending",
            additionalInfo: additionalInfo || "",
            createdAt: new Date(),
        };

        const result = await studySessionsCollection.insertOne(newSession);

        res.status(201).json({
            message: "Study session created successfully.",
            sessionId: result.insertedId,
        });
    } catch (error) {
        console.error("Error creating study session:", error);
        res.status(500).json({ error: "Failed to create study session." });
    }
});


app.get('/tutor-sessions', async (req, res) => {
    const { userId, page = 1, limit = 5 } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Tutor userId is required." });
    }

    const skip = (page - 1) * limit;

    try {
        const studySessionsCollection = db.collection("studySessions");

        const total = await studySessionsCollection.countDocuments({ userId: userId });
        const sessions = await studySessionsCollection
            .find({ userId: userId })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .toArray();

        res.status(200).json({ total, sessions });
    } catch (error) {
        console.error("Error fetching study sessions:", error);
        res.status(500).json({ error: "Failed to fetch study sessions." });
    }
});



app.patch('/study-sessions/:id/request-approval', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Session ID is required." });
    }

    try {
        const studySessionsCollection = db.collection("studySessions");

        const session = await studySessionsCollection.findOne({ _id: new ObjectId(id) });

        if (!session) {
            return res.status(404).json({ error: "Study session not found." });
        }

        if (session.status !== "rejected") {
            return res.status(400).json({ error: "Only rejected sessions can be sent for approval." });
        }

        const result = await studySessionsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "pending" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: "Failed to update session status." });
        }

        res.status(200).json({ message: "Approval request sent successfully." });
    } catch (error) {
        console.error("Error sending approval request:", error);
        res.status(500).json({ error: "Failed to send approval request." });
    }
});











app.post("/upload-materials/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    const { title, tutorEmail, driveLink, imageBase64 } = req.body;

    if (!title || !sessionId || !tutorEmail) {
        return res.status(400).json({ error: "All fields are required except the image." });
    }

    try {
        const materialsCollection = db.collection("materials");

        const newMaterial = {
            title,
            studySessionId: sessionId,
            tutorEmail,
            driveLink,
            imageBase64: imageBase64 || null,
            createdAt: new Date(),
        };

        const result = await materialsCollection.insertOne(newMaterial);

        res.status(201).json({
            message: "Material uploaded successfully.",
            materialId: result.insertedId,
        });
    } catch (error) {
        console.error("Error uploading material:", error);
        res.status(500).json({ error: "Failed to upload material." });
    }
});




app.get('/view-materials/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const materialsCollection = db.collection('materials');
        const materials = await materialsCollection.find({ studySessionId: sessionId }).toArray();

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials.' });
    }
});




app.delete('/delete-material/:materialsId', async (req, res) => {
    const { materialsId } = req.params;

    try {
        const materialsCollection = db.collection('materials');
        const result = await materialsCollection.deleteOne({ _id: new ObjectId(materialsId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Material not found.' });
        }

        res.status(200).json({ message: 'Material deleted successfully.' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material.' });
    }
});







app.get('/ongoing-sessions', async (req, res) => {
    try {
        const studySessionsCollection = db.collection('studySessions');
        const now = new Date();

        const approvedSessions = await studySessionsCollection
            .find({
                status: 'approved',
                regStartDate: { $lte: now },
                regEndDate: { $gte: now },
            })
            .limit(6)
            .toArray();


        res.status(200).json(approvedSessions);
    } catch (error) {
        console.error('Error fetching approved sessions:', error);
        res.status(500).json({ error: 'Failed to fetch approved sessions.' });
    }
});











app.get('/study-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { studentEmail } = req.query;

    try {
        const studySessionsCollection = db.collection('studySessions');
        const reviewsCollection = db.collection('reviews');
        const bookedSessionsCollection = db.collection('bookedSessions');

        const session = await studySessionsCollection.findOne({ _id: new ObjectId(sessionId) });
        if (!session) {
            return res.status(404).json({ error: 'Study session not found.' });
        }

        const reviews = await reviewsCollection.find({ sessionId }).toArray();
        const isBooked = !!(await bookedSessionsCollection.findOne({ sessionId, studentEmail }));
        const hasReviewed = !!(await reviewsCollection.findOne({ sessionId, studentEmail }));

        res.status(200).json({ session, reviews, isBooked, hasReviewed });
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Failed to fetch session details.' });
    }
});




app.post('/book-session', async (req, res) => {
    const { sessionId, studentEmail } = req.body;

    if (!sessionId || !studentEmail) {
        return res.status(400).json({ error: 'Session ID and student email are required.' });
    }

    try {
        const bookedSessionsCollection = db.collection('bookedSessions');
        const existingBooking = await bookedSessionsCollection.findOne({ sessionId, studentEmail });

        const sessionsCollection = db.collection('studySessions');
        const sessionsList = await sessionsCollection.findOne({ _id: new ObjectId(sessionId) });



        if (existingBooking) {
            return res.status(400).json({ error: 'You have already booked this session.' });
        }

        if (sessionsList.regFee > 0) {


            const stripe = require('stripe')('sk_test_51I7PnPGbjFcAkjgCiG7hxdDgNmKlPBdTXPmHzhPrbZWTIxGFHTK7p9YYGbDjD9TWv5U48tha2CcvjcrqBjwc5av600MlbVsfL1');
            const baseUrl = req.protocol + '://' + req.get('host');


            const stripeSession = await stripe.checkout.sessions.create({
                success_url: baseUrl + '/check-payment?payment_id={CHECKOUT_SESSION_ID}',
                line_items: [
                    {
                        price_data: {
                            currency: 'bdt',
                            product_data: {
                                name: sessionsList.title,
                            },
                            unit_amount: sessionsList.regFee * 1000,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                customer_email: studentEmail,
                metadata: {
                    sessionId: sessionId,
                    st_email: studentEmail
                }
            });

            if (stripeSession.url) {
                return res.status(203).json({
                    paymentUrl: stripeSession.url
                });
            } else {
                res.status(500).json({ error: 'Failed to book session.' });
            }
        } else {
            const newBooking = {
                sessionId,
                studentEmail,
                bookedAt: new Date(),
            };

            await bookedSessionsCollection.insertOne(newBooking);
            res.status(201).json({ message: 'Session booked successfully.' });
        }

    } catch (error) {
        console.error('Error booking session:', error);
        res.status(500).json({ error: 'Failed to book session.' });
    }
});



app.get("/check-payment", async (req, res) => {
    const { payment_id } = req.query;
    if (!payment_id) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const stripe = require('stripe')('sk_test_51I7PnPGbjFcAkjgCiG7hxdDgNmKlPBdTXPmHzhPrbZWTIxGFHTK7p9YYGbDjD9TWv5U48tha2CcvjcrqBjwc5av600MlbVsfL1');
        const stripeSession = await stripe.checkout.sessions.retrieve(payment_id);
        if ("metadata" in stripeSession && "payment_status" in stripeSession) {
            metadata = stripeSession.metadata;
            payment_status = stripeSession.payment_status;
            if ("sessionId" in metadata && "st_email" in metadata && payment_status == "paid") {
                const sessionId = metadata.sessionId;
                const studentEmail = metadata.st_email;

                const bookedSessionsCollection = db.collection('bookedSessions');
                const existingBooking = await bookedSessionsCollection.findOne({ sessionId, studentEmail });
                if (existingBooking) {
                    return res.status(400).json({ error: 'You have already booked this session.' });
                } else {
                    console.log("i'm here");
                    const newBooking = {
                        sessionId,
                        studentEmail,
                        bookedAt: new Date(),
                    };
                    await bookedSessionsCollection.insertOne(newBooking);
                    return res.redirect("http://localhost:5173/study-session/" + sessionId);
                }
            }
        }
        return res.json(stripeSession);
    } catch (error) {
        console.log(error);
        return res.json({})
    }
})







app.post('/post-review', async (req, res) => {
    const { sessionId, studentEmail, studentName, comment, rating } = req.body;

    if (!sessionId || !studentEmail || !studentName || !comment || !rating) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const reviewsCollection = db.collection('reviews');
        const existingReview = await reviewsCollection.findOne({ sessionId, studentEmail });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this session.' });
        }

        const newReview = {
            sessionId,
            studentEmail,
            studentName,
            comment,
            rating,
            createdAt: new Date(),
        };

        const result = await reviewsCollection.insertOne(newReview);
        res.status(201).json({ message: 'Review posted successfully.', review: newReview });
    } catch (error) {
        console.error('Error posting review:', error);
        res.status(500).json({ error: 'Failed to post review.' });
    }
});







app.get('/tutors', async (req, res) => {
    try {
        const usersCollection = db.collection('users');
        const tutors = await usersCollection
            .find({ role: 'tutor' })
            .project({ name: 1, email: 1, avatar: 1 })
            .toArray();

        res.status(200).json(tutors);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ error: 'Failed to fetch tutors.' });
    }
});





app.get('/booked-sessions', async (req, res) => {
    const { studentEmail } = req.query;

    if (!studentEmail) {
        return res.status(400).json({ error: 'Student email is required.' });
    }

    try {
        const bookedSessionsCollection = db.collection('bookedSessions');
        const studySessionsCollection = db.collection('studySessions');

        const bookedSessions = await bookedSessionsCollection.find({ studentEmail }).toArray();

        const sessionDetails = await Promise.all(
            bookedSessions.map(async (booked) => {
                const session = await studySessionsCollection.findOne({ _id: new ObjectId(booked.sessionId) });
                return {
                    ...session,
                    bookedId: booked._id,
                };
            })
        );

        res.status(200).json(sessionDetails);
    } catch (error) {
        console.error('Error fetching booked sessions:', error);
        res.status(500).json({ error: 'Failed to fetch booked sessions.' });
    }
});











app.post('/create-note', async (req, res) => {
    const { userId, email, title, description } = req.body;

    if (!email || !title || !description || !userId) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const notesCollection = db.collection('notes');

        const newNote = {
            userId,
            email,
            title,
            description,
            createdAt: new Date(),
        };

        const result = await notesCollection.insertOne(newNote);

        res.status(201).json({ message: 'Note created successfully.', noteId: result.insertedId });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note.' });
    }
});





app.get('/my-notes', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const notesCollection = db.collection('notes');
        const notes = await notesCollection.find({ userId: (userId) }).toArray();

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes.' });
    }
});



app.delete('/delete-note/:noteId', async (req, res) => {
    const { noteId } = req.params;

    if (!noteId) {
        return res.status(400).json({ error: 'Note ID is required.' });
    }

    try {
        const notesCollection = db.collection('notes');
        const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note.' });
    }
});




app.get('/get-note/:noteId', async (req, res) => {
    const { noteId } = req.params;

    try {
        const notesCollection = db.collection('notes');
        const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });

        if (!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note.' });
    }
});



app.put('/update-note/:noteId', async (req, res) => {
    const { noteId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
        const notesCollection = db.collection('notes');
        const result = await notesCollection.updateOne(
            { _id: new ObjectId(noteId) },
            { $set: { title, description, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Note not found or no changes made.' });
        }

        res.status(200).json({ message: 'Note updated successfully.' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note.' });
    }
});










app.get('/get-material/:materialId', async (req, res) => {
    const { materialId } = req.params;

    try {
        const materialsCollection = db.collection('materials');
        const material = await materialsCollection.findOne({ _id: new ObjectId(materialId) });

        if (!material) {
            return res.status(404).json({ error: 'Material not found.' });
        }

        res.status(200).json(material);
    } catch (error) {
        console.error('Error fetching material:', error);
        res.status(500).json({ error: 'Failed to fetch material.' });
    }
});



app.put('/update-material/:materialId', async (req, res) => {
    const { materialId } = req.params;
    const { title, driveLink, imageBase64 } = req.body;

    try {
        const materialsCollection = db.collection('materials');
        const result = await materialsCollection.updateOne(
            { _id: new ObjectId(materialId) },
            { $set: { title, driveLink, imageBase64, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Material not found or no changes made.' });
        }

        res.status(200).json({ message: 'Material updated successfully.' });
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ error: 'Failed to update material.' });
    }
});






app.get('/manage-study-sessions', async (req, res) => {
    const { search = '', status = '', page = 1, limit = 10 } = req.query;

    try {
        const query = {
            ...(status && { status }),
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { tutorName: { $regex: search, $options: 'i' } },
                { tutorEmail: { $regex: search, $options: 'i' } },
            ],
        };

        const studySessionsCollection = db.collection('studySessions');
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const total = await studySessionsCollection.countDocuments(query);
        const studySessions = await studySessionsCollection
            .find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.status(200).json({
            studySessions,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Error fetching study sessions:', error);
        res.status(500).json({ error: 'Failed to fetch study sessions.' });
    }
});




app.put('/approve-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { regFee } = req.body;

    if (regFee === undefined) {
        return res.status(400).json({ error: 'regFee is required.' });
    }

    try {
        const studySessionsCollection = db.collection('studySessions');
        const result = await studySessionsCollection.updateOne(
            { _id: new ObjectId(sessionId) },
            { $set: { status: 'approved', regFee } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        res.status(200).json({ message: 'Session approved successfully.' });
    } catch (error) {
        console.error('Error approving session:', error);
        res.status(500).json({ error: 'Failed to approve session.' });
    }
});


app.put('/reject-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const studySessionsCollection = db.collection('studySessions');
        const result = await studySessionsCollection.updateOne(
            { _id: new ObjectId(sessionId) },
            { $set: { status: 'rejected' } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        res.status(200).json({ message: 'Session rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting session:', error);
        res.status(500).json({ error: 'Failed to reject session.' });
    }
});


app.delete('/delete-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const studySessionsCollection = db.collection('studySessions');
        const result = await studySessionsCollection.deleteOne({ _id: new ObjectId(sessionId) });

        const bookedSessions = db.collection('bookedSessions');
        await bookedSessions.deleteOne({ sessionId: sessionId });
        const materials = db.collection('materials');
        await materials.deleteOne({ studySessionId: sessionId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        res.status(200).json({ message: 'Session deleted successfully.' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Failed to delete session.' });
    }
});


app.put('/update-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { regFee, status, feedback, rejectionReason } = req.body;

    if (!status || regFee === undefined) {
        return res.status(400).json({ error: 'Status and regFee are required.' });
    }

    try {
        const studySessionsCollection = db.collection('studySessions');
        const result = await studySessionsCollection.updateOne(
            { _id: new ObjectId(sessionId) },
            { $set: { status, regFee, rejectionReason, feedback } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'No changes occurred!' });
        }

        res.status(200).json({ message: 'Session updated successfully.' });
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ error: 'Failed to update session.' });
    }
});

app.get('/all-sessions', async (req, res) => {
    const { search = '', status = '', lastId } = req.query;
    const limit = 3; 
    
    try {
        const query = {
            status: 'approved',
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { tutorName: { $regex: search, $options: 'i' } },
                { tutorEmail: { $regex: search, $options: 'i' } },
            ],
        };

        if (status === 'upcoming') {
            query.regStartDate = { $gt: new Date() };
        } else if (status === 'ongoing') {
            query.regStartDate = { $lte: new Date() };
            query.regEndDate = { $gte: new Date() };
        } else if (status === 'outdated') {
            query.regEndDate = { $lt: new Date() };
        }

        if (lastId) {
            query._id = { $gt: new ObjectId(lastId) }; // Fetch items with _id greater than the last fetched item's _id
        }

        const studySessionsCollection = db.collection('studySessions');
        const studySessions = await studySessionsCollection
            .find(query)
            .limit(limit)
            .sort({ _id: 1 }) // Ensure consistent ordering
            .toArray();

        res.status(200).json(studySessions);
    } catch (error) {
        console.error('Error fetching study sessions:', error);
        res.status(500).json({ error: 'Failed to fetch study sessions.' });
    }
});












app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
