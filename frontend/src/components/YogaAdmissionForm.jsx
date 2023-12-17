import { useState } from "react";

const YogaAdmissionForm = () => {
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    selectedBatch: "",
    phoneNumber: "",
  });
  const [nameError, setNameError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [batchError, setBatchError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // "pending", "success", "error"

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const validateUserData = () => {
    // Clear previous errors
    setNameError("");
    setAgeError("");
    setBatchError("");
    setPhoneError("");
  
    // Check name
    if (!userData.name || userData.name.trim() === "") {
      setNameError("Name is required");
      return false;
    }
  
    // Check age
    if (!userData.age || isNaN(userData.age)) {
      setAgeError("Age is required and must be a number");
      return false;
    } else if (userData.age < 18 || userData.age > 65) {
      setAgeError("Age must be between 18 and 65");
      return false;
    }
  
    // Check batch selection
    if (!userData.selectedBatch) {
      setBatchError("Please select a batch");
      return false;
    } else if (!["6-7AM", "7-8AM", "8-9AM", "5-6PM"].includes(userData.selectedBatch)) {
      setBatchError("Invalid batch selection");
      return false;
    }
    if (!userData.phoneNumber || !/^\d{10}$/.test(userData.phoneNumber)) {
      setPhoneError("Phone number is required and must be a 10-digit number");
      return false;
    }
  
    // If all checks pass, return true
    return true;
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();

const  isvalid= validateUserData(); // Implement validation logic (age range etc.)
    console.log(isvalid);
    if(!isvalid)
    return ;
     
    setNameError("");
    setAgeError("");
    setBatchError("");
    setPhoneError("");

    try {
      setPaymentStatus("pending");


      const response = await fetch("http://localhost:3000/api/yoga-enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Simulate successful payment
        setPaymentStatus("success");
      } else {
        alert(`${JSON.stringify(responseData)}`);
        setPaymentStatus("error");
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-8 p-8 bg-white rounded shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-6">Yoga Admission Form</h1>
      <label
        htmlFor="name"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Name:
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={userData.name}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
          nameError && "border-red-500"
        }`}
      />
      {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}

      <label
        htmlFor="age"
        className="block text-gray-700 text-sm font-bold mb-2 mt-4"
      >
        Age:
      </label>
      <input
        type="number"
        id="age"
        name="age"
        value={userData.age}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
          ageError && "border-red-500"
        }`}
      />
      {ageError && <p className="text-red-500 text-sm mt-1">{ageError}</p>}

      <label
        htmlFor="phoneNumber"
        className="block text-gray-700 text-sm font-bold mb-2 mt-4"
      >
        Phone Number:
      </label>
      <input
        type="tel"
        id="phoneNumber"
        name="phoneNumber"
        value={userData.phoneNumber}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
          phoneError && "border-red-500"
        }`}
      />
      {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}

      <label
        htmlFor="selectedBatch"
        className="block text-gray-700 text-sm font-bold mb-2 mt-4"
      >
        Select Batch:
      </label>
      <select
        id="selectedBatch"
        name="selectedBatch"
        value={userData.selectedBatch}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 ${
          batchError && "border-red-500"
        }`}
      >
        <option value="">-- Select Batch --</option>
        <option value="6-7AM">6-7 AM</option>
        <option value="7-8AM">7-8 AM</option>
        <option value="8-9AM">8-9 AM</option>
        <option value="5-6PM">5-6 PM</option>
      </select>
      {batchError && <p className="text-red-500 text-sm mt-1">{batchError}</p>}

      <button
        type="submit"
        disabled={paymentStatus === "pending"}
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Enroll and Pay (₹500)
      </button>

      {paymentStatus === "pending" && (
        <p className="mt-4 text-gray-600">Processing payment...</p>
      )}
      {paymentStatus === "success" && (
        <p className="mt-4 text-green-600">
          Congrats! You have enrolled successfully.
        </p>
      )}
      {paymentStatus === "error" && (
        <p className="mt-4 text-red-600">
          Error during enrollment. Please try again.
        </p>
      )}
    </form>
  );
};

export default YogaAdmissionForm;


