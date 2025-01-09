// Utility Functions
const showError = (id, message) => {
  const errorElement = document.getElementById(id);
  if (errorElement) {
    errorElement.style.display = "block";
    errorElement.textContent = message;
  }
};

const hideAllErrors = () => {
  document.querySelectorAll(".error").forEach((error) => {
    error.style.display = "none";
  });
};

// Prevent Non-Numeric Input
const preventNonNumericInput = () => {
  const numericFields = ["zip", "cardNumber", "cvv", "expiry"];
  numericFields.forEach((id) => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
      inputElement.addEventListener("keypress", (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== "/") {
          e.preventDefault();
        }
      });
    }
  });
};

// Format Expiry Date Input (MM/YY)
const formatExpiryInput = () => {
  const expiryInput = document.getElementById("expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/[^0-9\/]/g, ""); // Remove invalid characters
      if (value.length > 2 && !value.includes("/")) {
        value = value.slice(0, 2) + "/" + value.slice(2); // Add slash after 2 digits
      }
      e.target.value = value.slice(0, 5); // Limit to 5 characters
    });
  }
};

// Validate Form Fields
const validateFormFields = () => {
  let isValid = true;

  const validations = [
    {
      field: "fullName",
      value: document.getElementById("fullName").value.trim(),
      errorId: "nameError",
      message: "Please enter your full name.",
      validate: (value) => !!value,
    },
    {
      field: "email",
      value: document.getElementById("email").value,
      errorId: "emailError",
      message: "Please enter a valid email address.",
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    },
    {
      field: "zip",
      value: document.getElementById("zip").value,
      errorId: "zipError",
      message: "Please enter a valid ZIP code (5-9 digits).",
      validate: (value) => /^[0-9]{5,9}$/.test(value),
    },
    {
      field: "cardNumber",
      value: document.getElementById("cardNumber").value,
      errorId: "cardError",
      message: "Please enter a valid card number (12-19 digits).",
      validate: (value) => /^[0-9]{12,19}$/.test(value),
    },
    {
      field: "expiry",
      value: document.getElementById("expiry").value,
      errorId: "expiryError",
      message: "Please enter a valid expiry date (MM/YY).",
      validate: (value) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value),
    },
    {
      field: "cvv",
      value: document.getElementById("cvv").value,
      errorId: "cvvError",
      message: "Please enter a valid CVV (3-4 digits).",
      validate: (value) => /^[0-9]{3,4}$/.test(value),
    },
  ];

  validations.forEach(({ errorId, value, validate, message }) => {
    if (!validate(value)) {
      showError(errorId, message);
      isValid = false;
    }
  });

  return isValid;
};


// Submit Form
const submitForm = async (formData) => {
  const modal = document.getElementById("responseModal");
  const modalMessage = document.getElementById("modalMessage");

  // Function to show the modal
  const showModal = (message, reloadOnClose = false) => {
    modalMessage.textContent = message;
    modal.style.display = "flex";

    // OK button logic
    document.getElementById("okButton").onclick = () => {
      modal.style.display = "none";
      if (reloadOnClose) {
        window.location.reload(); // Reload only on success
      }
    };
  };

  try {
    const response = await fetch(
      "https://paymentform-backend.onrender.com/submit-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw error; // Throw error to trigger catch block
    }

    const data = await response.json();
    console.log("Response:", data);

    // Show success message and reload on close
    showModal(data.message, true); // Pass `true` to reload on close
  } catch (err) {
    console.error("Error:", err);

    const detailedError =
      err.message && err.errors
        ? `${err.message}:\n${err.errors.join("\n")}`
        : `Error: ${err.message || "Unknown error"}`;

    // Show error message without reload
    showModal(detailedError, false); // Pass `false` to avoid reload
  }
};



// Form Validation Handler
const validateForm = (event) => {
  event.preventDefault();
  hideAllErrors();

  if (validateFormFields()) {
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      zip: document.getElementById("zip").value,
      cardNumber: document.getElementById("cardNumber").value,
      cardName: document.getElementById("cardName").value,
      expiry: document.getElementById("expiry").value,
      cvv: document.getElementById("cvv").value,
    };
    submitForm(formData);
  }

  return false;
};

// Initialize Event Listeners
const initialize = () => {
  preventNonNumericInput();
  formatExpiryInput();
};

initialize();
