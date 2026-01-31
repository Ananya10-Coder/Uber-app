import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation} from 'react-router-dom' 
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { SocketContext } from '../context/SocketContext';

const Riding = () => {
    const location = useLocation();
    const ride = location.state?.ride || JSON.parse(localStorage.getItem('activeRide'));;
    const { socket } = useContext(SocketContext);
    const [captainLocation, setCaptainLocation] = useState(null);
    const [directions, setDirections] = useState(null);

    useEffect(() => {
    if (!socket || !ride) return;

    socket.on('location-update', (data) => {
        if (data.rideId === ride._id) {
        setCaptainLocation({
            lat: data.lat,
            lng: data.lng
        });
        }
    });  
    return () => socket.off('location-update');
    }, [socket, ride]);

    useEffect(() => {
        if (!ride || !window.google) return;
    
        const service = new window.google.maps.DirectionsService();
    
        service.route(
          {
            origin: ride.pickup,
            destination: ride.destination,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === 'OK') {
              setDirections(result);
            } else {
              console.error('Directions failed:', status);
            }
          }
        );
      }, [ride]);    


    if (!ride) {
        return <div className="p-4">Loading ride details...</div>;
      }      

    return (
        <div className='h-screen'>
            <div className="h-1/2">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={captainLocation || { lat: 28.6139, lng: 77.2090 }}
                    zoom={15}
                    >
                    {captainLocation && <Marker position={captainLocation} />}

                        {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: '#000000',
                            strokeWeight: 4,
                        },
                        }}
                    />
                    )}
                </GoogleMap>
                
            </div>
            <Link to='/home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>
            <div className='h-1/2 p-4'>
                <div className='flex items-center justify-between'>
                    <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                    <div className='text-right'>
                        <h2 className='text-lg font-medium capitalize'>{ride.captain?.fullname
                ? `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`
                : 'Driver'} </h2>
                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>{ride.captain?.vehicle?.plate}</h4>
                        <p className='text-sm text-gray-600'>{ride.captain?.vehicle?.vehicleType}</p>

                    </div>
                </div>

                <div className='flex gap-2 justify-between flex-col items-center'>
                    <div className='w-full mt-5'>

                        <div className='flex items-center gap-5 p-3 border-b-2'>
                            <i className="text-lg ri-map-pin-2-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Destination</h3>
                                <p className='text-sm -mt-1 text-gray-600'>{ride.destination}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-5 p-3'>
                            <i className="ri-currency-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>₹{ride.fare} </h3>
                                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/home' className='w-full mt-5 flex  text-lg justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Make a payment</Link>
            </div>
        </div>
    )
}

export default Riding