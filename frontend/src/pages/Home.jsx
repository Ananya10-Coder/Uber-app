import React, { useState, useEffect, useContext } from 'react'
import 'remixicon/fonts/remixicon.css'
import axios from 'axios';

import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmRide from '../components/ConfirmRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  const [vehiclePanel, setVehiclePanel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false)
  const [pickupSuggestions, setPickupSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [activeField, setActiveField] = useState(null)
  const [vehicleType, setVehicleType] = useState(null);
  const [fare, setFare] = useState(null)
  const [ride, setRide] = useState(null)
  const [pickupSelected, setPickupSelected] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);

  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = (e) => e.preventDefault()

  const fetchFare = async () => {
    try {
      setFare(null);
  
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      setFare(response.data);
      setVehiclePanel(true);
    } catch (err) {
      console.error('Error fetching fare:', err);
    }
  };

  useEffect(() => {
    if (!socket || !user) return;
  
    socket.emit('join', {
      token: localStorage.getItem('token'),
      userType: 'user'
    });
  
  }, [socket, user]);  

  useEffect(()=>{
    if(pickupSelected && destinationSelected){
      fetchFare();
    }
  }, [pickupSelected, destinationSelected])

  useEffect(() => {
    if (!socket) return;
  
    socket.on('ride-confirmed', (ride) => {
      setWaitingForDriver(true);
      localStorage.setItem('activeRide', JSON.stringify(ride));
      
    });
  
    return () => socket.off('ride-confirmed');
  }, [socket]);
  
  useEffect(() => {
    const savedRide = localStorage.getItem('activeRide');
  
    if (savedRide) {
      const parsedRide = JSON.parse(savedRide);
      setRide(parsedRide);
      setWaitingForDriver(true);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
  
    socket.on('ride-started', (ride) => {
      localStorage.removeItem('activeRide');
      navigate('/riding', { state: { ride } });
    });
  
    return () => socket.off('ride-started');
  }, [socket]);
  
  

  const handlePickupChange = async(e) => {
    setPickup(e.target.value)
    setPickupSelected(false)
    try{
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
        params: {input: e.target.value},
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      })
      setPickupSuggestions(response.data);
    }
    catch(err){
      console.error("Error fetching pickup suggestions:", err);
    }
  }

  const handleDestinationChange = async(e) =>{
    setDestination(e.target.value)
    setDestinationSelected(false)
    try{
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
        params: {input: e.target.value},
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      })
      setDestinationSuggestions(response.data);
    }
    catch(err){
      console.error("Error fetching destination suggestions:", err);
    }
  }

  async function createRide() {
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    socket.emit('request-ride', {
      pickup: pickupSelected,
      destination: destinationSelected
    });
  }
  


  /* REUSABLE FIND TRIP BLOCK */
  const findTripBlock = (
    <>
      <h4 className="text-2xl font-semibold">Find a trip</h4>

      <input
        onFocus={() => {
          setPanelOpen(true)
          setActiveField('pickup')
        }}
        value={pickup}
        onChange={handlePickupChange}
        className="bg-[#eee] px-4 py-2 mt-4 rounded-lg w-full"
        placeholder="Add a pick-up location"
      />

      <input
        onFocus={() => {
          setPanelOpen(true)
          setActiveField('destination')
        }}
        value={destination}
        onChange={handleDestinationChange}
        className="bg-[#eee] px-4 py-2 mt-3 rounded-lg w-full"
        placeholder="Enter your destination"
      />
    </>
  )

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="map"
        />
      </div>

      {/* UBER LOGO */}
      <img
        className="w-16 absolute left-5 top-5 z-10"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber"
      />

      {/* HOME INPUT PANEL */}
      {!panelOpen && (
        <div className="absolute bottom-0 w-full bg-white p-6 z-20">
          <form onSubmit={submitHandler}>
            {findTripBlock}
          </form>
        </div>
      )}

      {/* LOCATION SEARCH PANEL */}
      {panelOpen && (
        <div className="fixed bottom-0 left-0 w-full h-[70%] bg-white z-30 flex flex-col">

          {/* STICKY INPUTS */}
          <div className="sticky top-0 bg-white p-6 border-b z-40">
            <form onSubmit={submitHandler}>
              {findTripBlock}
            </form>
          </div>

          {/* LOCATION LIST */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <LocationSearchPanel
              suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
              setPanelOpen={setPanelOpen}
              setVehiclePanel={setVehiclePanel}
              setPickup={setPickup}
              setDestination={setDestination}
              activeField={activeField}
              setPickupSelected={setPickupSelected}
              setDestinationSelected ={setDestinationSelected}
            />
          </div>
        </div>
      )}

      {/* VEHICLE PANEL */}
      {vehiclePanel && (
        <div className="fixed bottom-0 w-full bg-white z-40 px-4 py-10">
          <VehiclePanel
            selectVehicle = {setVehicleType}
            fare = {fare}
            setVehiclePanel={setVehiclePanel}
            setConfirmRidePanel={setConfirmRidePanel}
          />
        </div>
      )}

      {/* CONFIRM RIDE */}
      {confirmRidePanel && (
        <div className="fixed bottom-0 w-full bg-white z-50 px-4 py-6">
          <ConfirmRide
            setRide = {setRide}
            pickup = {pickup}
            destination ={destination}
            fare = {fare}
            vehicleType = {vehicleType}
            setConfirmRidePanel={setConfirmRidePanel}
            setVehicleFound={setVehicleFound}
          />
        </div>
      )}

      {/* LOOKING FOR DRIVER */}
      {vehicleFound && (
        <div className="fixed bottom-0 w-full bg-white z-50 px-4 py-6">
          <LookingForDriver 
          ride = {ride}
          setVehicleFound={setVehicleFound} />
        </div>
      )}

      {/* WAITING FOR DRIVER */}
      {waitingForDriver && (
        <div className="fixed bottom-0 w-full bg-white z-50 px-4 py-6">
          <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}  />
        </div>
      )}

    </div>
  )
}

export default Home
