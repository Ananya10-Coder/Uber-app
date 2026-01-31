const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const captainModel = require('./models/captain.model');
const userModel = require('./models/user.model');
const rideModel = require('./models/ride.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
          origin: 'http://localhost:5173',
          credentials: true
        },
        transports: ['websocket', 'polling']
      });
      

    io.on('connection', (socket) => {
        socket.on('join', async ({ token, userType }) => {
            try {
                if (!token || !userType) {
                    return socket.disconnect();
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded._id;

                if (userType === 'captain') {
                    socket.join(`captain:${userId}`);
                }

                if (userType === 'user') {
                    socket.join(`user:${userId}`);
                }
                socket.userId = decoded._id;
                socket.userType = userType;


            } catch (err) {
                console.log('Socket auth failed');
                socket.disconnect();
            }
        });

        socket.on('update-location-captain', async ({ token, location }) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const captainId = decoded.id;

                if (
                    !location ||
                    typeof location.ltd !== 'number' ||
                    typeof location.lng !== 'number'
                ) {
                    return;
                }

                await captainModel.findByIdAndUpdate(captainId, {
                    status: 'active',
                    location: {
                        ltd: location.ltd,
                        lng: location.lng
                    }
                });

            } catch (err) {
                console.log('Location update failed');
            }
        });

        socket.on('disconnect', () => {
        });

        socket.on('accept-ride', async ({ rideId }) => {
            try {

              const captainId = socket.userId;
              if(!captainId){
                console.log('captainId missing on socket');
                return;
              }
          
              const ride = await rideModel.findByIdAndUpdate(
                rideId,
                {   status: 'accepted',
                    captain: captainId
                 },
                { new: true }
              ).select('+otp').populate('user', 'fullname email').populate('captain', 'fullname vehicle');
          
              if (!ride) {
                console.log('ride not found');
                return;
              }
          
              // Emit to captains
              io.to(`captain:${captainId}`).emit('ride-accepted', ride);
          
              // Emit to user
              io.to(`user:${ride.user._id}`).emit('ride-confirmed', ride);
          
            } catch (err) {
              console.error('accept-ride error:', err.message);
            }
          });
          
        socket.on('verify-otp', async ({ rideId, otp }) => {
            try {
          
              const ride = await rideModel.findById(rideId)
                .select('+otp')
                .populate('user', 'fullname email')
                .populate('captain', 'fullname vehicle');
          
              if (!ride) {
                socket.emit('otp-error', 'Ride not found');
                return;
              }
          
              if (ride.otp !== otp) {
                socket.emit('otp-error', 'Invalid OTP');
                return;
              }
          
              ride.status = 'ongoing';
              await ride.save();
          
          
              io.emit('ride-started', ride)
            } catch (err) {
              console.error('OTP verify error:', err.message);
            }
          });
          
        socket.on('captain-location', ({ rideId, lat, lng }) => {
            if (!rideId) return;
          
            io.emit('location-update', {
              rideId,
              lat,
              lng
            });
          });
          
        
    });

}

const sendMessageToUser = (userType, userId, event, data) => {
    if (!io) return;

    io.to(`${userType}:${userId}`).emit(event, data);
};

const getIO = () => io;

module.exports = {
    initializeSocket,
    sendMessageToUser,
    getIO
};
