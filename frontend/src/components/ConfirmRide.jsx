import React from 'react';
import axios from 'axios';

const ConfirmRide = ({
  pickup,
  destination,
  vehicleType,
  setVehicleFound,
  setConfirmRidePanel,
  setVehiclePanel,
  setRide
}) => {

  const handleConfirm = async () => {   
    try {
      const response = await axios.post(
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

      setRide(response.data);
      setConfirmRidePanel(false);
      setVehicleFound(true);

    } catch (err) {
      console.error('Error creating ride:', err);
    }
  };

  return (
    <div className="relative">

      {/* CLOSE ARROW */}
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          setVehiclePanel(false);
          setConfirmRidePanel(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      {/* TITLE */}
      <h3 className="text-2xl font-semibold mb-5 mt-8">
        Confirm your Ride
      </h3>

      {/* CONFIRM BUTTON */}
      <button
        onClick={handleConfirm}
        className="w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg"
      >
        Confirm
      </button>

    </div>
  );
};

export default ConfirmRide;
