const captainModel = require('../models/captain.model.js');
const {validationResult} = require('express-validator');
const captainService = require('../services/captain.service');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerCaptain = async(req, res, next) => {
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {fullname, email, password, status, vehicle, location} = req.body;

    const isCaptainAlreadyExists = await captainModel.findOne({email})
    if(isCaptainAlreadyExists){
        return res.status(400).json({message: "Captain already exists"});
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        status,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
    })

    const captainToken = captain.generateAuthToken();
    res.status(201).json({captainToken, captain});


}
 
module.exports.loginCaptain = async(req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password} = req.body;

    const captain = await captainModel.findOne({email: email}).select("+password");
    if(!captain){
        return res.status(401).json({message: "Invalid email or password"});
    }

    const isMatch = await captain.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({message: "Invalid email or password"});
    }

    const captainToken = captain.generateAuthToken();
    res.cookie('captainToken', captainToken);
    res.status(200).json({captainToken, captain});
}

module.exports.getCaptainProfile = async(req, res, next) => {
    
    res.status(200).json(req.captain);
}

module.exports.logoutCaptain = async(req, res, next) =>{
    const captainToken = req.cookies.captainToken || req.headers.authorization.split(' ')[ 1 ];
    await blacklistTokenModel.create({captainToken});
    res.clearCookie('captainToken');
    res.status(200).json({message: 'Logged out'});
}