require("dotenv").config();

const config= require("./config.js");
const mongoose= require("mongoose");
const bcrypt= require("bcrypt");
const express=  require("express");
const cors= require("cors");
const jwt= require("jsonwebtoken");
const upload= require("./multer");
const fs= require("fs");
const path= require("path");

const { authenticateToken }= require("./utilities.js");

const User= require("./models/user.model.js");
const TravelStory= require("./models/travelStory.model.js");

mongoose.connect(config.connectionString);

const app= express();
app.use(express.json())

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    credentials: true,
}));



//create account
app.post("/create-account", async ( req, res ) => {
    const { fullName, email, password }= req.body;

    if(!fullName || !email || !password){
        return res
            .status(400)
            .json({ error: true, message: "All fields are required"});
    }

    const isUser= await User.findOne({email});
    if(isUser){
        return res
            .status(400)
            .json({error: true, message: "User already exists"});
    }

    const hashedPassword= await bcrypt.hash(password, 10);

    const user= new User({
        fullName,
        email,
        password: hashedPassword,
    });

    await user.save();

    const accessToken= jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "720h",
        }
    );

    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken,
        message: "Registration Successful",
    });

});

//login
app.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: "Email and Password are required"});
    }

    const user= await User.findOne({email});
    if(!user){
        return res.status(400).json({message: "User not found"});
    }

    const isPasswordValid= await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid Credentials"});
    }

    const accessToken= jwt.sign(
        { userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "720h",
        }
    );

    return res.json({
        error: false,
        message: "Login Successful",
        user: { fullName: user.fullName, email: user.email },
        accessToken,
    });

});

//get user
app.get("/get-user", authenticateToken, async( req, res ) => {
    const { userId }= req.user;

    const isUser= await User.findOne({ _id: userId });

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user: isUser,
        message: "",
    });
});


//Route to handle image upload
app.post("/image-upload", upload.single("image"), async( req, res ) => {
    try {
        let imageUrl;

        // Check if an image is uploaded
        if (req.file) {
            // If image is uploaded, set the image URL to the uploaded file's path
            imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        } else {
            // If no image uploaded, use a default placeholder image URL
            imageUrl = `http://localhost:8000/assets/placeholder.png`;
        }

        // Respond with the image URL
        res.status(201).json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

//delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
    const { imageUrl }= req.query;

    if(!imageUrl){
        return res
            .status(400)
            .json({ error: true, message: "imageUrl parameter is required"});
    }

    try{
        //extract the filename from the imageUrl
        const filename= path.basename(imageUrl);

        //define the file path
        const filePath= path.join(__dirname, 'uploads', filename);

        //check if file exists
        if(fs.existsSync(filePath)) {
            //delete the file from the uploads folder
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted successfully "});
        }
        else {
            res.status(200).json({ error: true, message: "Image not found"});
        }
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message });
    }
});


//serve static files  from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));


//Add travel story
app.post("/add-travel-story", authenticateToken, async( req, res )=> {
    const { title, story, visitedLocation, imageUrl, visitedDate }= req.body;
    const { userId }= req.user;

    //validate required fields
    if ( !title || !story || !visitedLocation || !imageUrl || !visitedDate ){
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    //convert visitedDate from millisec to date object
    const parsedVisitedDate= new Date(parseInt(visitedDate));

    try{
        const travelStory= new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parsedVisitedDate,
        });

        await travelStory.save();
        res.status(201).json({ story: travelStory, message: "Added Successfully"});
    }
    catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});


//get all travel stories
app.get("/get-all-stories", authenticateToken, async( req, res ) => {
    const { userId }= req.user;

    try{
        const travelStories= await TravelStory.find({ userId: userId }). sort({
            isFavourite: -1,
        });

        res.status(200).json({ stories: travelStories });
    }
    catch (error){
        res.status(500).json({ error: true, message: error.message });
    }
});


//edit travel story
app.put("/edit-story/:id", authenticateToken, async(req, res) => {
    const { id }= req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate }= req.body;
    const { userId }= req.user;

    //validate required fields
    if ( !title || !story || !visitedLocation || !visitedDate ){
        return res
            .status(400)
            .json({ error: true, message: "All fields are required" });
    }

    //convert visitedDate from millisec to date object
    const parsedVisitedDate= new Date(parseInt(visitedDate));

    try {
        //find the travel story by ID and ensure it belongs to the author
        const travelStory= await TravelStory.findOne({ _id: id, userId: userId });

        if(!travelStory){
            return res.status(400).json({ error: true, message: "Travel Story not found"});
        }

        const placeholderImgUrl= `http://localhost:8000/assets/placeholder.png`;

        travelStory.title= title;
        travelStory.story= story;
        travelStory.visitedLocation= visitedLocation;
        travelStory.imageUrl= imageUrl || placeholderImgUrl;
        travelStory.visitedDate= parsedVisitedDate;

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update Successful"});
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message});
    }
});

//delete a travel story
app.delete("/delete-story/:id", authenticateToken, async(req, res) => {
    const { id }= req.params;
    const { userId }= req.user;

    try{
        //find the travel story by ID and ensure it belongs to authenticated user
        const travelStory= await TravelStory.findOne({_id: id, userId: userId });

        if(!travelStory){
            return res
                .status(404)
                .json({ error: true, message: "Travel story not found"});
        }

        //delete the travel story from the database
        await travelStory.deleteOne({_id: id, userId: userId});

        //extract the filename from the imageUrl
        const imageUrl= travelStory.imageUrl;
        const filename= path.basename(imageUrl);

        //define the file path
        const filePath= path.join(__dirname, 'uploads', filename);

        //delete the image file from the uploads folder
        fs.unlink(filePath, (err) => {
            if(err){
                console.error("Failed to delete image file:", err);
                //optionally, you could still respond with a success status here
                //if you don;t want to treat this as a critical error
            }
        });

        res.status(200).json({ message: "Travel Story Deleted Successfully"});
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message });
    }
})

//update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async(req, res) => {
    const { id }= req.params;
    const { isFavourite }= req.body;
    const { userId }= req.user;

    try{
        const travelStory= await TravelStory.findOne({_id: id, userId: userId});

        if(!travelStory){
            return res.status(400).json({ error: true, message: "Travel Story not found"});
        }

        travelStory.isFavourite= isFavourite;

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update Succesful"});
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message });
    }
});


//search travel stories
app.get("/search", authenticateToken, async(req, res) => {
    const { query }= req.query;
    const { userId }= req.user;

    if(!query) {
        return res.status(404).json({ error: true, message: "Query is required"});
    }
    
    try{
        const searchResults= await TravelStory.find({
            userId: userId,
            $or: [
                { title: { $regex: query, $options: "i" }},
                { story: { $regex: query, $options: "i" }},
                { visitedLocation: { $regex: query, $options: "i" }},
            ],
        }).sort({ isFavourite: -1 });

        res.status(200).json({ stories: searchResults });
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message });
    }

});

//Filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async(req, res) => {
    const { startDate, endDate }= req.query;
    const { userId }= req.user;

    try{
        //convert startDate and endDate from millsec to Date objects
        const start= new Date(parseInt(startDate));
        const end= new Date(parseInt(endDate));

        //find travel stories that belong to the authenticated user and fall within the date range
        const filteredStories= await TravelStory.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end},
        }).sort({ isFavourite: -1 });

        res.status(200).json({ stories: filteredStories });
    }
    catch(error){
        res.status(500).json({ error: true, message: error.message });
    }

});



//MongoDB connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
.then(() => console.log('MongoDB Server connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
});

module.exports= app;

