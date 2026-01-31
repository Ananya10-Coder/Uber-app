const rideService = require('../services/ride.service');
const {validationResult} = require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const { getIO } = require('../socket');
const captainModel = require('../models/captain.model');


module.exports.createRide = async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {userId, pickup, destination, vehicleType} = req.body;

    try{
        const ride = await rideService.createRide({user: req.user._id, pickup, destination, vehicleType});
        const populatedRide = await rideModel.findOne({ _id: ride._id })
            .populate('user', 'fullname email')
            .lean(); 
        const io = getIO();
        const captains = await captainModel.find();
        captains.forEach(captain=> {
            io.emit('new-ride', { test: 'it works' });
            io.to(`captain:${captain._id}`).emit('new-ride', populatedRide);

        });
        return res.status(200).json(ride);       
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message: err.message});
    }
}

module.exports.getFareEstimate = async(req, res) =>{
    try{
        const {pickup, destination} = req.query;
        if(!pickup || !destination){
            return res.status(400).json({message: "Pickup and destination are both required"})
        }
        const fare = await rideService.getFare(pickup, destination)
        return res.status(200).json(fare)
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}