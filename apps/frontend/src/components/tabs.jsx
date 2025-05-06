import { useState, useEffect } from 'react';
import Card from './card';
import { useProperty } from '../contexts/PropertyContext';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Tab components now use real property data
const PropertyCardComponent = ({ propertyType = null, currentUser }) => {
  // Use the useProperty hook instead of direct context
  const { dbProperties, loading, fetchPropertiesByType, error } = useProperty();
  const router = useRouter();
  
  // Add console logs to debug
  useEffect(() => {
    console.log('PropertyCardComponent mounting with type:', propertyType, 'currentUser:', currentUser?.uid);
    // Pass the property type to fetch only that type
    if (propertyType) {
      fetchPropertiesByType(propertyType);
    } else {
      fetchPropertiesByType();
    }
  }, [fetchPropertiesByType, propertyType, currentUser]);

  // Log what we got back
  useEffect(() => {
    console.log('Current dbProperties:', dbProperties);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }, [dbProperties, loading, error]);

  // Handle property click to navigate to detail page
  const handlePropertyClick = (property) => {
    router.push(`/property/${property._id}`);
  };

  if (loading) {
    return <div className="text-center p-10">Loading properties...</div>;
  }

  if (dbProperties.length === 0) {
    return <div className="text-center p-10">No {propertyType || 'properties'} found.</div>;
  }

  return (
    <div className="flex flex-col sm:grid md:grid-cols-2 xl:grid-cols-3 gap-5 m-5 p-5">
      {dbProperties.map((property) => (
        <Card 
          key={property._id} 
          property={property} 
          onClick={handlePropertyClick}
        />
      ))}
    </div>
  );
};

const Tabs = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { currentUser } = useAuth();

  // Define tabs with propertyType values that EXACTLY match the database values
  const tabs = [
    { label: 'Home', propertyType: 'Home' },
    { label: 'Apartment', propertyType: 'Apartment' },
    { label: 'Office', propertyType: 'Office' },
    { label: 'Warehouse', propertyType: 'Warehouse' },
    { label: 'Parking', propertyType: 'Parking' },
    { label: 'Commercial', propertyType: 'Commercial' },
  ];

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`${
              idx === activeTabIndex
                ? 'border-b-2 border-orange-500 text-orange-500 '
                : 'text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-500'
            } px-2 font-normal py-4 sm:px-6 sm:font-medium focus:outline-none ${
              idx === 3 && 'hidden sm:flex'
            }`}
            onClick={() => setActiveTabIndex(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <PropertyCardComponent 
          propertyType={tabs[activeTabIndex].propertyType} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
};

export default Tabs;
