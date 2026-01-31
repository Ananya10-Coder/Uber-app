import React from 'react';

const LocationSearchPanel = ({
  suggestions,
  setVehiclePanel,
  setPanelOpen,
  setPickup,
  setDestination,
  activeField,
  setPickupSelected,
  setDestinationSelected
}) => {

  const handleSuggestionClick = (suggestion) => {
    if (activeField === 'pickup') {
      setPickup(suggestion.description || suggestion);
      setPickupSelected(true);
    } else {
      setDestination(suggestion.description || suggestion);
      setDestinationSelected(true);
    }

    setPanelOpen(false);
  };

  return (
    <div>
      {suggestions.map((elem, idx) => (
        <div
          key={elem.place_id || idx}
          onClick={() => handleSuggestionClick(elem)}
          className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2"
        >
          <div className="bg-[#eee] h-8 w-8 flex items-center justify-center rounded-full">
            <i className="ri-map-pin-fill"></i>
          </div>
          <h4 className="font-medium">
            {elem.description || elem}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
