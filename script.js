// Dummy data for doctor schedules
// Using current date for example (June 16, 2025)
const schedules = {
    kebidanan: [
        { date: "2025-06-16", time: "17:00", doctor: "Dr. Ani", capacity: 20, patients: [] },
        { date: "2025-06-17", time: "14:00", doctor: "Dr. Budi", capacity: 20, patients: [] }
    ],
    umum: [
        { date: "2025-06-16", time: "17:30", doctor: "Dr. Cita", capacity: 20, patients: [] },
        { date: "2025-06-18", time: "09:00", doctor: "Dr. Dewi", capacity: 15, patients: [] }
    ],
    "penyakit-dalam": [
        { date: "2025-06-17", time: "11:00", doctor: "Dr. Dedi", capacity: 20, patients: [] }
    ],
    gigi: [
        { date: "2025-06-16", time: "18:00", doctor: "Dr. Eka", capacity: 20, patients: [] }
    ]
};

// Dummy data for users
const users = {
    patient: { username: "pasien1", password: "pasien123", role: "patient" },
    doctor: { username: "dokter1", password: "dokter123", role: "doctor" },
    admin: { username: "admin1", password: "admin123", role: "admin" }
};

// Function to display temporary messages (success/error)
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) { // Check if element exists
        element.textContent = message;
        element.style.color = isError ? "red" : "green";
        element.style.opacity = "1";
        setTimeout(() => (element.style.opacity = "0"), 3000);
    }
}

// Toggle navbar on small screens
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });
}

// Toggle language (visual only)
document.querySelectorAll(".lang").forEach(lang => {
    lang.addEventListener("click", (e) => {
        e.preventDefault();
        const activeLang = document.querySelector(".lang.active");
        if (activeLang) {
            activeLang.classList.remove("active");
        }
        lang.classList.add("active");
    });
});

// Function to update operational status and time in Quick Info
function updateOperationalStatus() {
    const statusText = document.getElementById("status-text");
    const currentTimeElement = document.getElementById("current-time");
    
    const now = new Date(); // Current date and time
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.querySelector('.sidebar-content ul li:nth-child(4)');
    if (dateElement) {
        dateElement.textContent = `Tanggal: ${now.toLocaleDateString('id-ID', options)}`;
    }
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Update current time
    if (currentTimeElement) {
        currentTimeElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} WIB`;
    }

    // Check operational status (08:00 - 20:00 WIB)
    const startHour = 8;
    const endHour = 20;
    if (statusText) {
        if (hours >= startHour && hours < endHour) {
            statusText.textContent = "Buka";
            statusText.classList.add("open");
            statusText.classList.remove("closed");
        } else {
            statusText.textContent = "Tutup";
            statusText.classList.add("closed");
            statusText.classList.remove("open");
        }
    }
}

// Login function
function login(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleSelect = document.getElementById("role-select");
    const loginError = document.getElementById("login-error");

    if (!usernameInput || !passwordInput || !roleSelect || !loginError) {
        console.error("Login form elements not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;
    const role = roleSelect.value;

    const user = users[role];
    if (user && username === user.username && password === user.password) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("login-link").classList.add("hidden");
        document.getElementById("start-link").classList.add("hidden"); 
        
        const container = document.querySelector(".container");
        if (container) {
            container.style.display = "flex"; 
        }
        
        // Hide all user role sections initially to prevent display issues
        document.getElementById("patient-section")?.classList.add("hidden");
        document.getElementById("doctor-section")?.classList.add("hidden");
        document.getElementById("admin-section")?.classList.add("hidden");

        if (role === "patient") {
            document.getElementById("patient-section")?.classList.remove("hidden");
            displayPatientDoctorSchedule(); // Show doctor schedules for patients
            populatePoliDropdown("poli-select"); // Update patient's poli dropdown
            updateScheduleOptions(); // Update patient registration form (schedules for selected poli)
        } else if (role === "doctor") {
            document.getElementById("doctor-section")?.classList.remove("hidden");
            updateDoctorSchedule(); // Show doctor's own schedule view
            populatePoliDropdown("schedule-poli-select"); // Update poli dropdown for adding new schedule
        } else if (role === "admin") {
            document.getElementById("admin-section")?.classList.remove("hidden");
            updateAdminRecap(); // Show admin recap
        }
        navMenu?.classList.remove("active");
        loginError.textContent = "";
    } else {
        showMessage("login-error", "Username atau password salah!", true);
    }
}

// Logout function
function logout() {
    // Hide all card sections
    document.querySelectorAll(".card").forEach(card => card.classList.add("hidden"));
    
    // Show login section
    document.getElementById("login-section")?.classList.remove("hidden");
    
    // Show login and start links
    document.getElementById("login-link")?.classList.remove("hidden");
    document.getElementById("start-link")?.classList.remove("hidden");
    
    // Ensure container is visible to show login section
    document.querySelector(".container").style.display = "flex";
    
    // Hide splash screen
    document.querySelector(".splash-screen").style.display = "none";
    
    // Reset login form
    document.getElementById("login-form")?.reset();
    
    // Hide patient confirmation
    document.getElementById("patient-confirmation")?.classList.add("hidden");
    
    // Close mobile navigation menu
    navMenu?.classList.remove("active");
}

// Function to update schedule options in the patient registration form based on selected poli
function updateScheduleOptions() {
    const poliSelect = document.getElementById("poli-select");
    const scheduleSelect = document.getElementById("schedule-select");

    if (!poliSelect || !scheduleSelect) {
        console.error("Poli select or Schedule select not found.");
        return;
    }

    const poli = poliSelect.value;
    scheduleSelect.innerHTML = "";
    
    // Sort schedules by date and time
    const sortedSchedules = (schedules[poli] || []).slice().sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (sortedSchedules.length > 0) {
        sortedSchedules.forEach((sched, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${sched.date} ${sched.time} - ${sched.doctor} (${sched.patients.length}/${sched.capacity})`;
            scheduleSelect.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Tidak ada jadwal tersedia";
        option.disabled = true;
        scheduleSelect.appendChild(option);
    }
}

// Function to register a patient
function registerPatient(event) {
    event.preventDefault();
    const patientNameInput = document.getElementById("patient-name");
    const poliSelect = document.getElementById("poli-select");
    const scheduleSelect = document.getElementById("schedule-select");
    const confirmationDiv = document.getElementById("patient-confirmation");
    const confirmationText = document.getElementById("confirmation-text");
    const qrCodeDiv = document.getElementById("qrcode");

    if (!patientNameInput || !poliSelect || !scheduleSelect || !confirmationDiv || !confirmationText || !qrCodeDiv) {
        console.error("Patient registration form elements not found.");
        return;
    }

    const patientName = patientNameInput.value;
    const poli = poliSelect.value;
    const scheduleIndex = scheduleSelect.value;

    if (!patientName) {
        showMessage("confirmation-text", "Nama wajib diisi!", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    if (!schedules[poli] || schedules[poli].length === 0) {
        showMessage("confirmation-text", "Tidak ada jadwal tersedia untuk poli ini.", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    // Ensure scheduleIndex is a valid number
    const selectedSchedule = schedules[poli][parseInt(scheduleIndex, 10)];
    if (!selectedSchedule) {
        showMessage("confirmation-text", "Silakan pilih jadwal yang valid.", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    if (selectedSchedule.patients.length >= selectedSchedule.capacity) {
        showMessage("confirmation-text", "Jadwal penuh!", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    const queueNumber = selectedSchedule.patients.length + 1;
    const estimatedTime = calculateEstimatedTime(selectedSchedule.time, queueNumber);
    selectedSchedule.patients.push({ name: patientName, queue: queueNumber });

    confirmationText.textContent = `Berhasil! Antrian: ${queueNumber}, Estimasi: ${estimatedTime}`;
    confirmationDiv.classList.remove("hidden");

    qrCodeDiv.innerHTML = "";
    const qrText = `Antrian: ${queueNumber}\nNama: ${patientName}\nPoli: ${poli}\nDokter: ${selectedSchedule.doctor}\nTanggal: ${selectedSchedule.date}\nWaktu: ${selectedSchedule.time}`;
    try {
        new QRCode(qrCodeDiv, {
            text: qrText,
            width: 128,
            height: 128,
            colorDark: "#2a4066",
            colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.error("Error generating QR code:", e);
        // Fallback or message to user
    }

    updateDoctorSchedule(); // Update doctor's view
    displayPatientDoctorSchedule(); // Update patient's view
    updateScheduleOptions(); // Update patient registration form (capacity info)
    document.getElementById("registration-form")?.reset();
}

// Function to calculate estimated time
function calculateEstimatedTime(startTime, queueNumber) {
    const [hour, minute] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + queueNumber * 10; // 10 minutes per patient
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
}

// Function to display doctor schedules (for doctor's view)
function updateDoctorSchedule() {
    const doctorScheduleDiv = document.getElementById("doctor-schedule");
    if (!doctorScheduleDiv) {
        console.error("Doctor schedule div not found.");
        return;
    }
    doctorScheduleDiv.innerHTML = "";
    
    // Get all schedules flattened and sorted
    const allSchedules = [];
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach(sched => {
            allSchedules.push({ ...sched, poliName: poli });
        });
    });

    allSchedules.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (allSchedules.length > 0) {
        let currentPoli = "";
        allSchedules.forEach(sched => {
            // Add a new poli header if it's a different polyclinic
            if (sched.poliName !== currentPoli) {
                const poliTitle = document.createElement("h5");
                poliTitle.textContent = `Poli ${sched.poliName.charAt(0).toUpperCase() + sched.poliName.slice(1)}`;
                doctorScheduleDiv.appendChild(poliTitle);
                currentPoli = sched.poliName;
            }

            const scheduleItem = document.createElement("div");
            scheduleItem.className = "schedule-item";
            scheduleItem.innerHTML = `
                <p><strong>${sched.date} ${sched.time}</strong> - ${sched.doctor} (${sched.patients.length}/${sched.capacity} pasien)</p>
            `;
            if (sched.patients.length > 0) {
                const patientList = document.createElement("ul");
                patientList.className = "patient-list ml-2"; // Add some margin left
                sched.patients.forEach(patient => {
                    const patientItem = document.createElement("li");
                    patientItem.textContent = `${patient.name} (Antrian: ${patient.queue})`;
                    patientList.appendChild(patientItem);
                });
                scheduleItem.appendChild(patientList);
            } else {
                scheduleItem.innerHTML += `<p class="ml-2">Tidak ada pasien.</p>`;
            }
            doctorScheduleDiv.appendChild(scheduleItem);
        });
    } else {
        doctorScheduleDiv.innerHTML = "<p>Tidak ada jadwal yang tersedia.</p>";
    }
}

// Function to display doctor schedules (for patient's view)
function displayPatientDoctorSchedule() {
    const patientDoctorScheduleDiv = document.getElementById("patient-doctor-schedule");
    if (!patientDoctorScheduleDiv) {
        console.error("Patient doctor schedule div not found.");
        return;
    }
    patientDoctorScheduleDiv.innerHTML = "";
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // McClellan-MM-DD format for today

    const schedulesToShow = [];
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach(sched => {
            // Only show schedules from today onwards
            if (new Date(sched.date) >= new Date(today)) {
                schedulesToShow.push({ ...sched, poliName: poli });
            }
        });
    });

    schedulesToShow.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (schedulesToShow.length > 0) {
        schedulesToShow.forEach(sched => {
            const scheduleItem = document.createElement("div");
            scheduleItem.className = "schedule-item";
            scheduleItem.innerHTML = `
                <p><strong>Poli: ${sched.poliName.charAt(0).toUpperCase() + sched.poliName.slice(1)}</strong></p>
                <p>Dokter: ${sched.doctor}</p>
                <p>Tanggal: ${sched.date}</p>
                <p>Waktu: ${sched.time}</p>
                <p>Ketersediaan: ${sched.capacity - sched.patients.length} dari ${sched.capacity}</p>
            `;
            patientDoctorScheduleDiv.appendChild(scheduleItem);
        });
    } else {
        patientDoctorScheduleDiv.innerHTML = "<p>Tidak ada jadwal dokter yang tersedia saat ini.</p>";
    }
}

// Function to display admin recap
function updateAdminRecap() {
    const adminRecapDiv = document.getElementById("admin-recap");
    if (!adminRecapDiv) {
        console.error("Admin recap div not found.");
        return;
    }
    adminRecapDiv.innerHTML = "";
    const recapData = {};

    Object.keys(schedules).forEach(poli => {
        recapData[poli] = 0; // Initialize total patients for each poly
        schedules[poli].forEach(sched => {
            recapData[poli] += sched.patients.length;
        });
    });

    if (Object.keys(recapData).length > 0) {
        for (const poli in recapData) {
            const p = document.createElement("p");
            p.textContent = `${poli.charAt(0).toUpperCase() + poli.slice(1)}: ${recapData[poli]} pasien terdaftar`;
            adminRecapDiv.appendChild(p);
        }
    } else {
        adminRecapDiv.innerHTML = "<p>Belum ada data rekap layanan.</p>";
    }
}

// Function to populate polyclinic options in a specific dropdown
function populatePoliDropdown(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.error(`Poli select element with ID ${selectId} not found.`);
        return;
    }
    selectElement.innerHTML = "";
    const poliNames = Object.keys(schedules).sort(); // Sort poli names alphabetically
    
    if (poliNames.length > 0) {
        poliNames.forEach(poli => {
            const option = document.createElement("option");
            option.value = poli;
            option.textContent = poli.charAt(0).toUpperCase() + poli.slice(1);
            selectElement.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Tidak ada poli tersedia";
        option.disabled = true;
        selectElement.appendChild(option);
    }
}

// Function to add a new polyclinic (Doctor Role)
function addPolyclinic(event) {
    event.preventDefault();
    const newPoliNameInput = document.getElementById("new-poli-name");
    if (!newPoliNameInput) {
        console.error("New poli name input not found.");
        return;
    }
    const newPoliName = newPoliNameInput.value.toLowerCase().trim();

    if (!newPoliName) {
        showMessage("add-poli-message", "Nama poli tidak boleh kosong.", true);
        return;
    }

    if (schedules[newPoliName]) {
        showMessage("add-poli-message", `Poli '${newPoliName}' sudah ada.`, true);
    } else {
        schedules[newPoliName] = []; // Add new empty array for the polyclinic
        populatePoliDropdown("schedule-poli-select"); // Update doctor's add schedule poli dropdown
        populatePoliDropdown("poli-select"); // NEW: Update patient's registration poli dropdown
        updateScheduleOptions(); // Refresh patient's schedule dropdown based on current poli
        showMessage("add-poli-message", `Poli '${newPoliName}' berhasil ditambahkan.`);
        newPoliNameInput.value = ""; // Clear input field
    }
}

// Function to add a new doctor schedule (Doctor Role)
function addDoctorSchedule(event) {
    event.preventDefault();
    const poliSelect = document.getElementById("schedule-poli-select");
    const dateInput = document.getElementById("schedule-date");
    const timeInput = document.getElementById("schedule-time");
    const doctorInput = document.getElementById("schedule-doctor");
    const capacityInput = document.getElementById("schedule-capacity");

    if (!poliSelect || !dateInput || !timeInput || !doctorInput || !capacityInput) {
        console.error("Add doctor schedule form elements not found.");
        return;
    }

    const poli = poliSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const doctor = doctorInput.value.trim();
    const capacity = parseInt(capacityInput.value, 10);

    if (!poli || !date || !time || !doctor || isNaN(capacity) || capacity <= 0) {
        showMessage("add-schedule-message", "Harap isi semua kolom dengan benar.", true);
        return;
    }

    if (!schedules[poli]) {
        schedules[poli] = []; 
    }

    // Check for duplicate schedule for the same doctor on the same date and time
    const isDuplicate = schedules[poli].some(sched => 
        sched.date === date && sched.time === time && sched.doctor.toLowerCase() === doctor.toLowerCase()
    );

    if (isDuplicate) {
        showMessage("add-schedule-message", "Jadwal dokter ini pada tanggal dan waktu tersebut sudah ada.", true);
        return;
    }

    schedules[poli].push({ date, time, doctor, capacity, patients: [] });
    showMessage("add-schedule-message", "Jadwal dokter berhasil ditambahkan!");
    updateDoctorSchedule(); // Refresh doctor's view with new schedule
    updateScheduleOptions(); // Refresh patient's schedule dropdown (if new poli has schedules)
    displayPatientDoctorSchedule(); // Refresh patient's doctor schedule display
    document.getElementById("add-doctor-schedule-form")?.reset(); // Clear form
}

// Function to generate PDF report (Admin Role)
async function generateAdminReportPDF(event) {
    event.preventDefault();
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        showMessage("pdf-message", "Error: jsPDF library not loaded. Please check your internet connection.", true);
        console.error("jsPDF library not found.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const periodRadio = document.querySelector('input[name="recap-period"]:checked');
    if (!periodRadio) {
        showMessage("pdf-message", "Pilih periode laporan (Mingguan/Bulanan).", true);
        return;
    }
    const period = periodRadio.value;
    const now = new Date();
    let startDate, endDate;
    let reportTitle;

    if (period === "weekly") {
        reportTitle = "Rekap Laporan Mingguan";
        // Calculate start of the week (Monday) and end (Sunday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0); // Set to start of the day
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
    } else { // monthly
        reportTitle = "Rekap Laporan Bulanan";
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
    }

    const startDateFormat = startDate.toISOString().split('T')[0];
    const endDateFormat = endDate.toISOString().split('T')[0];

    let yPos = 10;
    doc.setFontSize(16);
    doc.text(reportTitle, 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Periode: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, 10, yPos);
    yPos += 20;

    let totalGlobalPatients = 0;
    let hasData = false;

    // Iterate through polyclinics
    Object.keys(schedules).forEach(poli => {
        let totalPatientsForPoli = 0;
        let poliSchedules = [];

        // Filter schedules within the selected period
        schedules[poli].forEach(sched => {
            const scheduleDate = new Date(`${sched.date}T${sched.time}`); // Include time for accurate comparison
            if (scheduleDate >= startDate && scheduleDate <= endDate) {
                totalPatientsForPoli += sched.patients.length;
                poliSchedules.push(sched);
            }
        });

        // Add poli data to PDF if there are schedules for the period
        if (poliSchedules.length > 0) {
            hasData = true;
            // Check for new page if content exceeds current page height
            if (yPos + 30 > doc.internal.pageSize.height - 10) { // Estimate space needed for next poli header and some items
                doc.addPage();
                yPos = 10; // Reset y position for new page
            }
            doc.setFontSize(14);
            doc.text(`Poli ${poli.charAt(0).toUpperCase() + poli.slice(1)} (Total Pasien: ${totalPatientsForPoli})`, 10, yPos);
            yPos += 10;
            doc.setFontSize(10);

            // Sort schedules for the current poli
            poliSchedules.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            }).forEach(sched => {
                if (yPos + 15 > doc.internal.pageSize.height - 10) { // Check if schedule item will fit
                    doc.addPage();
                    yPos = 10;
                    doc.setFontSize(14); // Re-add poli title on new page
                    doc.text(`Poli ${poli.charAt(0).toUpperCase() + poli.slice(1)} (Lanjutan)`, 10, yPos);
                    yPos += 10;
                    doc.setFontSize(10);
                }
                doc.text(`  - ${sched.date} ${sched.time}, Dokter: ${sched.doctor}, Pasien: ${sched.patients.length}/${sched.capacity}`, 15, yPos);
                yPos += 7;
                if (sched.patients.length > 0) {
                    sched.patients.forEach(patient => {
                        if (yPos + 5 > doc.internal.pageSize.height - 10) { // Check if patient item will fit
                            doc.addPage();
                            yPos = 10;
                            doc.setFontSize(10); // Maintain font size
                        }
                        doc.text(`    Antrian ${patient.queue}: ${patient.name}`, 20, yPos);
                        yPos += 5;
                    });
                }
            });
            yPos += 5; // Add a small gap after each poly
            totalGlobalPatients += totalPatientsForPoli;
        }
    });

    // Final total or no data message
    if (!hasData) {
        doc.text("Tidak ada data laporan untuk periode yang dipilih.", 10, yPos);
    } else {
        if (yPos + 10 > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yPos = 10;
        }
        doc.setFontSize(14);
        doc.text(`Total Keseluruhan Pasien: ${totalGlobalPatients}`, 10, yPos + 10);
    }

    doc.save(`${reportTitle.toLowerCase().replace(/ /g, '_')}_${startDateFormat}_${endDateFormat}.pdf`);
    showMessage("pdf-message", "Laporan PDF berhasil dibuat!");
}


// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    updateOperationalStatus(); // Call function to update Quick Info
    setInterval(updateOperationalStatus, 60000); // Update every minute

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }

    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) {
        registrationForm.addEventListener("submit", registerPatient);
    }
    
    // Patient section
    const poliSelectPatient = document.getElementById("poli-select");
    if (poliSelectPatient) {
        poliSelectPatient.addEventListener("change", updateScheduleOptions);
    }

    // Doctor section
    const addPoliForm = document.getElementById("add-poli-form");
    if (addPoliForm) {
        addPoliForm.addEventListener("submit", addPolyclinic);
    }
    const addDoctorScheduleForm = document.getElementById("add-doctor-schedule-form");
    if (addDoctorScheduleForm) {
        addDoctorScheduleForm.addEventListener("submit", addDoctorSchedule);
    }

    // Admin section
    const generatePdfForm = document.getElementById("generate-pdf-form");
    if (generatePdfForm) {
        generatePdfForm.addEventListener("submit", generateAdminReportPDF);
    }

    // Common navigation and logout listeners
    document.querySelectorAll("#login-link, #start-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            document.getElementById("login-section")?.classList.remove("hidden");
            document.querySelector(".splash-screen").style.display = "none";
            document.querySelector(".container").style.display = "flex";
            navMenu?.classList.remove("active");
        });
    });
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", (e) => e.preventDefault());
    });

    // Add event listeners for logout buttons in each section
    document.getElementById("logout-patient")?.addEventListener("click", logout);
    document.getElementById("logout-doctor")?.addEventListener("click", logout);
    document.getElementById("logout-admin")?.addEventListener("click", logout);

    // Initial calls to ensure content is loaded for roles that might be pre-selected (if not authenticated)
    // These will be properly re-called by login() based on role
    populatePoliDropdown("poli-select"); // Initial load for patient poli dropdown
    updateScheduleOptions(); // Initial load for patient schedule dropdown
    updateDoctorSchedule(); // Initial load for doctor schedule view
    displayPatientDoctorSchedule(); // Initial load for patient doctor schedule display
    populatePoliDropdown("schedule-poli-select"); // Initial load for doctor add schedule poli dropdown
});
