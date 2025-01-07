      // Prevent non-numeric input where needed
      function preventNonNumericInput() {
        ["zip", "cardNumber", "cvv", "expiry"].forEach((id) => {
          document
            .getElementById(id)
            .addEventListener("keypress", function (e) {
              if (!/[0-9]/.test(e.key) && e.key !== "/") {
                e.preventDefault();
              }
            });
        });
      }

      // Format expiry date (MM/YY)
      function formatExpiryInput() {
        const expiryInput = document.getElementById("expiry");
        expiryInput.addEventListener("input", (e) => {
          let value = e.target.value;

          // Remove invalid characters
          value = value.replace(/[^0-9\/]/g, "");

          // Automatically add a slash after the first two digits
          if (value.length > 2 && !value.includes("/")) {
            value = value.slice(0, 2) + "/" + value.slice(2);
          }

          // Limit the input to 5 characters
          value = value.slice(0, 5);

          e.target.value = value;
        });
      }

      // Validate form fields
      function validateForm(event) {
        event.preventDefault();

        // Reset errors
        document
          .querySelectorAll(".error")
          .forEach((error) => (error.style.display = "none"));

        let isValid = true;

        // Validate full name
        const fullName = document.getElementById("fullName");
        if (!fullName.value.trim()) {
          document.getElementById("nameError").style.display = "block";
          isValid = false;
        }

        // Validate email
        const email = document.getElementById("email");
        if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          document.getElementById("emailError").style.display = "block";
          isValid = false;
        }

        // Validate ZIP
        const zip = document.getElementById("zip");
        if (!zip.value.match(/^[0-9]{5,9}$/)) {
          document.getElementById("zipError").style.display = "block";
          isValid = false;
        }

        // Validate card number
        const cardNumber = document.getElementById("cardNumber");
        if (!cardNumber.value.match(/^[0-9]{12,19}$/)) {
          document.getElementById("cardError").style.display = "block";
          isValid = false;
        }

        // Validate expiry
        const expiry = document.getElementById("expiry");
        if (!expiry.value.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
          document.getElementById("expiryError").style.display = "block";
          isValid = false;
        }

        // Validate CVV
        const cvv = document.getElementById("cvv");
        if (!cvv.value.match(/^[0-9]{3,4}$/)) {
          document.getElementById("cvvError").style.display = "block";
          isValid = false;
        }

        // If form is valid, submit data
        if (isValid) {
          const formData = {
            fullName: fullName.value,
            email: email.value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            zip: zip.value,
            cardNumber: cardNumber.value,
            cardName: document.getElementById("cardName").value,
            expiry: expiry.value,
            cvv: cvv.value,
          };
          const modal = document.getElementById("responseModal");
          const modalMessage = document.getElementById("modalMessage");
          const closeModal = document.getElementById("closeModal");

          // Function to show the modal
          function showModal(message) {
            modalMessage.textContent = message;
            modal.style.display = "flex";
          }

          // Event listener to close the modal
          closeModal.onclick = () => {
            modal.style.display = "none";
          };

          // Close modal when clicking outside the modal content
          window.onclick = (event) => {
            if (event.target === modal) {
              modal.style.display = "none";
            }
          };

          fetch("https://paymentform-backend.onrender.com/submit-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })
            .then((response) => {
              if (!response.ok) {
                return response.json().then((err) => {
                  throw err;
                });
              }
              return response.json();
            })
            .then((data) => {
              console.log("Response:", data);
              showModal(data.message);
              window.location.reload();
            })
            .catch((err) => {
              console.error("Error:", err);

              if (err.message && err.errors) {
                const detailedError = `${err.message}:\n${err.errors.join(
                  "\n"
                )}`;
                showModal(detailedError);
              } else {
                showModal(`Error: ${err.message || "Unknown error"}`);
              }
            });
        }
        return false;
      }

      // Initialize
      preventNonNumericInput();
      formatExpiryInput();