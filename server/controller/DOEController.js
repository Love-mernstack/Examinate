const DOE = require('../models/DOE.js');
const path = require("path"); 
async function generateUniqueUsername(dob, aadhar) {
    try {
        if (!dob || !aadhar || aadhar.length < 3) {
            throw new Error("Invalid DOB or Aadhar number provided");
        }

        const dateOfBirth = new Date(dob);
        if (isNaN(dateOfBirth.getTime())) {
            throw new Error("Invalid date format");
        }

        const YY = String(dateOfBirth.getFullYear()).slice(-2);
        const MM = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
        const DD = String(dateOfBirth.getDate()).padStart(2, "0");
        const baseID = `${YY}${MM}${DD}`;

        let uniqueDigits = aadhar.slice(-3);
        let username = `D${baseID}${uniqueDigits}`;
        let existingUser = await DOE.findOne({ username });

        while (existingUser) {
            uniqueDigits = (parseInt(uniqueDigits) + 1).toString().padStart(3, "0");
            username = `D${baseID}${uniqueDigits}`;
            existingUser = await DOE.findOne({ username });
        }
        return username;
    } catch (error) {
        console.error("Error generating username:", error);
        return "E9999999999";
    }
}



module.exports.createDOE=async (req, res,next) => {
    try {
        const { email, Name, mobile, universityName, aadhar, city, pincode, address, state, dob, department} = req.body;
        const dobDate = new Date(dob);
        const username = await generateUniqueUsername(dobDate, aadhar);
        const password = Name;
        let user = await DOE.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists' });
        const passportPhotoPath = req.file ? path.join("uploads/profile", req.file.filename) : null;
        const newUser = new DOE({
            email, Name, mobile, universityName, aadhar, city, pincode, address, state, dob,username,password,department,passportPhoto:passportPhotoPath
        })
        await newUser.save();
        req.body.username= username;
        req.body.password= password;
        // res.json({ message: "DOE Registered", username, password });
        next();
    } catch (err) {
        res.status(500).json({ message: "Error creating DOE", error: err.message });
    }
}